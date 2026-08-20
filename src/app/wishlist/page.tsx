"use client";

import { useState, useEffect, useCallback } from "react";
import { Film, GripVertical, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Movie } from "@/db/schema";
import { priorityConfig, priorities, formats } from "@/components/MovieCard";

const categoryMeta: Record<string, { color: string; bg: string; badge: string }> = {
  "Buy Next": { color: "border-blue-500", bg: "bg-blue-500/5", badge: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  High: { color: "border-orange-500", bg: "bg-orange-500/5", badge: "bg-orange-500/15 text-orange-700 dark:text-orange-400" },
  Medium: { color: "border-yellow-500", bg: "bg-yellow-500/5", badge: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
  Low: { color: "border-zinc-400", bg: "bg-zinc-500/5", badge: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
  Skip: { color: "border-zinc-300", bg: "bg-zinc-500/5", badge: "bg-zinc-500/10 text-zinc-400 dark:text-zinc-500" },
};

export default function WishlistPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragItem, setDragItem] = useState<{ id: number; priority: string | null } | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [skipCollapsed, setSkipCollapsed] = useState(true);

  const fetchMovies = useCallback(() => {
    fetch("/api/movies?status=wishlist&sort=title")
      .then((r) => r.json() as Promise<Movie[]>)
      .then((data) => {
        setMovies(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const moviesByCategory = priorities.map((priority) => ({
    priority,
    label: priorityConfig[priority]?.label || priority,
    ...(categoryMeta[priority] || categoryMeta.Low),
    movies: movies
      .filter((m) => m.wishlistPriority === priority)
      .sort((a, b) => {
        if (a.wishlistRank != null && b.wishlistRank != null) return a.wishlistRank - b.wishlistRank;
        if (a.wishlistRank != null) return -1;
        if (b.wishlistRank != null) return 1;
        return (a.title || "").localeCompare(b.title || "");
      }),
  }));

  const handleDragStart = (movie: Movie) => {
    setDragItem({ id: movie.id, priority: movie.wishlistPriority });
  };

  const handleDragOver = (e: React.DragEvent, movieId: number | null, category: string) => {
    e.preventDefault();
    setDragOverId(movieId);
    setDragOverCategory(category);
  };

  const handleDrop = async (e: React.DragEvent, targetMovieId: number | null, targetPriority: string) => {
    e.preventDefault();
    if (!dragItem) return;

    const sourceId = dragItem.id;
    const sourcePriority = dragItem.priority;

    setDragItem(null);
    setDragOverId(null);
    setDragOverCategory(null);

    const priorityChanged = sourcePriority !== targetPriority;

    if (priorityChanged) {
      await fetch(`/api/movies/${sourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlistPriority: targetPriority }),
      });
    }

    setMovies((prev) => {
      const updated = prev.map((m) =>
        m.id === sourceId ? { ...m, wishlistPriority: targetPriority } : m
      );

      const categoryMovies = updated
        .filter((m) => m.wishlistPriority === targetPriority)
        .sort((a, b) => {
          if (a.wishlistRank != null && b.wishlistRank != null) return a.wishlistRank - b.wishlistRank;
          if (a.wishlistRank != null) return -1;
          if (b.wishlistRank != null) return 1;
          return (a.title || "").localeCompare(b.title || "");
        });

      if (targetMovieId && targetMovieId !== sourceId) {
        const sourceIdx = categoryMovies.findIndex((m) => m.id === sourceId);
        const targetIdx = categoryMovies.findIndex((m) => m.id === targetMovieId);
        if (sourceIdx !== -1 && targetIdx !== -1) {
          const [moved] = categoryMovies.splice(sourceIdx, 1);
          categoryMovies.splice(targetIdx, 0, moved);
        }
      }

      const rankedIds = categoryMovies.map((m, i) => ({ id: m.id, rank: i }));
      fetch("/api/movies/wishlist-rank", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rankedIds),
      });

      const rankedMap = new Map(rankedIds.map((r) => [r.id, r.rank]));
      return updated.map((m) =>
        rankedMap.has(m.id) ? { ...m, wishlistRank: rankedMap.get(m.id)! } : m
      );
    });
  };

  const handlePriorityChange = async (movieId: number, newPriority: string) => {
    await fetch(`/api/movies/${movieId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishlistPriority: newPriority }),
    });
    setMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, wishlistPriority: newPriority } : m))
    );
  };

  const handleMarkOwned = async (movieId: number) => {
    await fetch(`/api/movies/${movieId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "owned", wishlistPriority: null }),
    });
    setMovies((prev) => prev.filter((m) => m.id !== movieId));
  };

  const handlePreferredFormatChange = async (movieId: number, format: string | null) => {
    await fetch(`/api/movies/${movieId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferredFormat: format }),
    });
    setMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, preferredFormat: format } : m))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const wishlistOnly = movies.filter((m) => m.wishlistPriority !== "Skip");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Wishlist</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {wishlistOnly.length} movie{wishlistOnly.length !== 1 ? "s" : ""} — drag to reorder, change category with the dropdown
        </p>
      </div>

      {moviesByCategory.map((cat) => {
        const isSkip = cat.priority === "Skip";

        if (isSkip) {
          return (
            <div key={cat.priority} className="space-y-2">
              <button
                onClick={() => setSkipCollapsed(!skipCollapsed)}
                className="flex items-center gap-2 group"
              >
                {skipCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                )}
                <h2 className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                  {cat.label}
                </h2>
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", cat.badge)}>
                  {cat.movies.length}
                </span>
              </button>

              {!skipCollapsed && (
                <div
                  className={cn(
                    "rounded-xl border-2 border-dashed transition-colors min-h-[60px]",
                    dragOverCategory === cat.priority && dragItem?.priority !== cat.priority
                      ? `${cat.color} ${cat.bg}`
                      : "border-transparent"
                  )}
                  onDragOver={(e) => handleDragOver(e, null, cat.priority)}
                  onDrop={(e) => handleDrop(e, null, cat.priority)}
                >
                  {cat.movies.length === 0 ? (
                    <div className="flex items-center justify-center py-6 text-sm text-zinc-400 dark:text-zinc-500">
                      No movies skipped
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {cat.movies.map((movie, idx) => (
                        <WishlistItem
                          key={movie.id}
                          movie={movie}
                          rank={idx + 1}
                          isDragging={dragItem?.id === movie.id}
                          isDragOver={dragOverId === movie.id}
                          onDragStart={() => handleDragStart(movie)}
                          onDragOver={(e) => handleDragOver(e, movie.id, cat.priority)}
                          onDrop={(e) => handleDrop(e, movie.id, cat.priority)}
                          onDragEnd={() => { setDragItem(null); setDragOverId(null); setDragOverCategory(null); }}
                          onPriorityChange={handlePriorityChange}
                          onMarkOwned={handleMarkOwned}
                          onPreferredFormatChange={handlePreferredFormatChange}
                          dimmed
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        }

        return (
          <div key={cat.priority} className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {cat.label}
              </h2>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", cat.badge)}>
                {cat.movies.length}
              </span>
            </div>

            <div
              className={cn(
                "rounded-xl border-2 border-dashed transition-colors min-h-[60px]",
                dragOverCategory === cat.priority && dragItem?.priority !== cat.priority
                  ? `${cat.color} ${cat.bg}`
                  : "border-transparent"
              )}
              onDragOver={(e) => handleDragOver(e, null, cat.priority)}
              onDrop={(e) => handleDrop(e, null, cat.priority)}
            >
              {cat.movies.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-sm text-zinc-400 dark:text-zinc-500">
                  {dragOverCategory === cat.priority ? "Drop here" : "No movies in this category"}
                </div>
              ) : (
                <div className="space-y-1">
                  {cat.movies.map((movie, idx) => (
                    <WishlistItem
                      key={movie.id}
                      movie={movie}
                      rank={idx + 1}
                      isDragging={dragItem?.id === movie.id}
                      isDragOver={dragOverId === movie.id}
                      onDragStart={() => handleDragStart(movie)}
                      onDragOver={(e) => handleDragOver(e, movie.id, cat.priority)}
                      onDrop={(e) => handleDrop(e, movie.id, cat.priority)}
                      onDragEnd={() => { setDragItem(null); setDragOverId(null); setDragOverCategory(null); }}
                      onPriorityChange={handlePriorityChange}
                      onMarkOwned={handleMarkOwned}
                      onPreferredFormatChange={handlePreferredFormatChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WishlistItem({
  movie,
  rank,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onPriorityChange,
  onMarkOwned,
  onPreferredFormatChange,
  dimmed,
}: {
  movie: Movie;
  rank: number;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onPriorityChange: (id: number, priority: string) => void;
  onMarkOwned: (id: number) => void;
  onPreferredFormatChange: (id: number, format: string | null) => void;
  dimmed?: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-30",
        isDragOver
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700",
        dimmed && "opacity-60"
      )}
    >
      <GripVertical className="w-4 h-4 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />

      <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 w-5 text-right tabular-nums flex-shrink-0">
        {rank}
      </span>

      <Link href={`/movie/${movie.id}`} className="flex-shrink-0 w-8 h-12 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Film className="w-4 h-4 text-zinc-400" />
        )}
      </Link>

      <Link href={`/movie/${movie.id}`} className="flex-1 min-w-0">
        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate block">
          {movie.title}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {movie.year}
          {movie.director && ` · ${movie.director}`}
        </span>
      </Link>

      <span className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 w-20 truncate">
        {movie.genre || "—"}
      </span>

      <select
        value={movie.preferredFormat || ""}
        onChange={(e) => {
          e.stopPropagation();
          onPreferredFormatChange(movie.id, e.target.value || null);
        }}
        onClick={(e) => e.stopPropagation()}
        className="hidden sm:block w-20 px-1.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        <option value="">Format</option>
        {formats.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>

      <select
        value={movie.wishlistPriority || "Medium"}
        onChange={(e) => {
          e.stopPropagation();
          const val = e.target.value;
          if (val === "__owned__") {
            onMarkOwned(movie.id);
          } else {
            onPriorityChange(movie.id, val);
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className="w-24 px-1.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        {priorities.map((p) => (
          <option key={p} value={p}>
            {priorityConfig[p]?.label || p}
          </option>
        ))}
        <option value="__owned__">Mark Owned</option>
      </select>
    </div>
  );
}

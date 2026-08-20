"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MovieCard } from "./MovieCard";
import { MovieRow } from "./MovieRow";
import { SearchBar } from "./SearchBar";
import type { Movie } from "@/db/schema";
import { Film, Package, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stats {
  total: number;
  byGenre: Array<{ genre: string; count: number }>;
  byMedium: Array<{ medium: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
}

export function MovieLibrary() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState<"grid" | "rows">("grid");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/movies/stats")
      .then((r) => r.json() as Promise<Stats>)
      .then(setStats);
  }, []);

  const fetchMovies = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (genre) params.set("genre", genre);
    params.set("status", "owned");

    if (sortBy === "year-desc") {
      params.set("sort", "year");
      params.set("order", "desc");
    } else if (sortBy === "year-asc") {
      params.set("sort", "year");
      params.set("order", "asc");
    } else if (sortBy === "tomatometer") {
      params.set("sort", "tomatometer");
      params.set("order", "desc");
    } else {
      params.set("sort", "title");
    }

    fetch(`/api/movies?${params}`)
      .then((r) => r.json() as Promise<Movie[]>)
      .then((data) => {
        setMovies(data);
        setLoading(false);
      });
  }, [search, genre, sortBy]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const genres = useMemo(
    () => stats?.byGenre.map((g) => g.genre).filter(Boolean) || [],
    [stats]
  );

  const ownedCount = useMemo(() => {
    if (!stats) return 0;
    return stats.byStatus.find((s) => s.status === "owned")?.count || 0;
  }, [stats]);

  const handleStatusChange = useCallback(async (movieId: number, newStatus: string) => {
    await fetch(`/api/movies/${movieId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setMovies((prev) =>
      prev.map((m) => (m.id === movieId ? { ...m, status: newStatus } : m))
    );
  }, []);

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Owned"
            value={ownedCount}
            icon={<Package className="w-5 h-5 text-emerald-500" />}
          />
          <StatCard
            label="4K Titles"
            value={stats.byMedium.find((m) => m.medium === "4K")?.count || 0}
            icon={<span className="text-lg">✨</span>}
          />
          <StatCard
            label="Blu-ray"
            value={stats.byMedium.find((m) => m.medium === "Blu-ray")?.count || 0}
            icon={<span className="text-lg">💿</span>}
          />
          <StatCard
            label="Total Tracked"
            value={stats.total}
            icon={<Film className="w-5 h-5 text-zinc-500" />}
          />
        </div>
      )}

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by title, director, or actor..."
      />

      {/* Genre pills + sort + view toggle */}
      <div className="flex flex-wrap items-center gap-1.5">
        <GenrePill label="All" active={!genre} onClick={() => setGenre("")} />
        {genres.map((g) => (
          <GenrePill
            key={g}
            label={g}
            active={genre === g}
            onClick={() => setGenre(genre === g ? "" : g)}
          />
        ))}

        <div className="ml-auto flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="title">Sort: Title</option>
            <option value="year-desc">Sort: Newest</option>
            <option value="year-asc">Sort: Oldest</option>
            <option value="tomatometer">Sort: Rating</option>
          </select>

          <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("rows")}
              className={cn(
                "p-2 transition-colors",
                viewMode === "rows"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        {loading ? (
          "Loading..."
        ) : (
          <>
            {movies.length} movie{movies.length !== 1 ? "s" : ""}
            {(search || genre) && " found"}
          </>
        )}
      </div>

      {!loading && viewMode === "rows" ? (
        <div className="space-y-1">
          {movies.map((movie) => (
            <MovieRow key={movie.id} movie={movie} onStatusChange={handleStatusChange} />
          ))}
        </div>
      ) : !loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : null}

      {!loading && movies.length === 0 && (
        <div className="text-center py-12">
          <Film className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400">No movies found</p>
        </div>
      )}
    </div>
  );
}

function GenrePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
        active
          ? "bg-blue-500 text-white"
          : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600"
      )}
    >
      {label}
    </button>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      {icon}
      <div>
        <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {value}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { MovieCard } from "./MovieCard";
import { MovieRow } from "./MovieRow";
import { SearchBar } from "./SearchBar";
import { FilterBar } from "./FilterBar";
import type { Movie } from "@/db/schema";
import { Disc3, Film, Package, ShoppingCart, LayoutGrid, List } from "lucide-react";
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
  const [medium, setMedium] = useState("");
  const [status, setStatus] = useState("");
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
    if (medium) params.set("medium", medium);
    if (status) params.set("status", status);

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
  }, [search, genre, medium, status, sortBy]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const genres = useMemo(
    () => stats?.byGenre.map((g) => g.genre).filter(Boolean) || [],
    [stats]
  );
  const mediums = useMemo(
    () => stats?.byMedium.map((m) => m.medium).filter(Boolean) || [],
    [stats]
  );

  const ownedCount = useMemo(() => {
    if (!stats) return 0;
    return stats.byStatus
      .filter((s) => s.status === "1 - Owned" || s.status === "1 - Shipped")
      .reduce((sum, s) => sum + s.count, 0);
  }, [stats]);

  const wishlistCount = useMemo(() => {
    if (!stats) return 0;
    return stats.total - ownedCount -
      (stats.byStatus.find((s) => s.status === "5 - Skip")?.count || 0);
  }, [stats, ownedCount]);

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
            label="Wishlist"
            value={wishlistCount}
            icon={<ShoppingCart className="w-5 h-5 text-blue-500" />}
          />
          <StatCard
            label="4K Titles"
            value={stats.byMedium.find((m) => m.medium === "4K")?.count || 0}
            icon={<span className="text-lg">✨</span>}
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

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <FilterBar
            genres={genres}
            mediums={mediums}
            selectedGenre={genre}
            selectedMedium={medium}
            selectedStatus={status}
            sortBy={sortBy}
            onGenreChange={setGenre}
            onMediumChange={setMedium}
            onStatusChange={setStatus}
            onSortChange={setSortBy}
          />
        </div>

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

      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        {loading ? (
          "Loading..."
        ) : (
          <>
            {movies.length} movie{movies.length !== 1 ? "s" : ""}
            {(search || genre || medium || status) && " found"}
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

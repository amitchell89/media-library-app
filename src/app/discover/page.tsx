"use client";

import { useState, useCallback } from "react";
import { Search, Film, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TmdbResult {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  overview: string | null;
  voteAverage: number | null;
}

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await fetch(
      `/api/tmdb/search?q=${encodeURIComponent(query.trim())}`
    );
    const data = (await res.json()) as TmdbResult[];
    setResults(data);
    setLoading(false);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Search className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Discover Movies</h1>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Search any movie to see details, log a watch, or add it to your
        wishlist.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
          className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Film className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400">
            No results found for &quot;{query}&quot;
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {results.map((movie) => (
            <Link
              key={movie.tmdbId}
              href={`/movie/tmdb/${movie.tmdbId}`}
              className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-16 h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {movie.year || "Unknown year"}
                    </p>
                    {movie.voteAverage !== null && movie.voteAverage > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 text-sm text-zinc-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{movie.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                    {movie.overview && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 line-clamp-2">
                        {movie.overview}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

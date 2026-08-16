"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  Disc3,
  Film,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import type { Movie, Binder } from "@/db/schema";

interface Stats {
  total: number;
  binders: Binder[];
  byBinder: Array<{ binderId: number | null; binderName: string; count: number }>;
}

export default function BindersPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [expandedBinder, setExpandedBinder] = useState<number | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/movies").then((r) => r.json()),
      fetch("/api/movies/stats").then((r) => r.json()),
    ]).then(([moviesData, statsData]) => {
      setMovies(moviesData);
      setStats(statsData);
    });
  }, []);

  const binderData = useMemo(() => {
    if (!stats) return [];

    return stats.binders.map((binder) => {
      const binderMovies = movies.filter((m) => m.binderId === binder.id);
      const categories: Record<string, Movie[]> = {};

      for (const movie of binderMovies) {
        const cat = movie.binderCategory || "Uncategorized";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(movie);
      }

      const sortedCategories = Object.entries(categories).sort(([a], [b]) =>
        a.localeCompare(b)
      );

      return {
        binder,
        movies: binderMovies,
        categories: sortedCategories,
        used: binderMovies.length,
        remaining: binder.capacity - binderMovies.length,
        percentFull: Math.round((binderMovies.length / binder.capacity) * 100),
      };
    });
  }, [movies, stats]);

  const unassigned = useMemo(
    () => movies.filter((m) => !m.binderId),
    [movies]
  );

  const totalCapacity = stats?.binders.reduce((sum, b) => sum + b.capacity, 0) || 0;
  const totalUsed = movies.filter((m) => m.binderId).length;

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Binder Storage</h1>
      </div>

      {/* Overall capacity */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-500">
            Overall Capacity
          </span>
          <span className="text-sm text-zinc-500">
            {totalUsed} / {totalCapacity} slots ({Math.round((totalUsed / totalCapacity) * 100)}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              totalUsed / totalCapacity > 0.9
                ? "bg-red-500"
                : totalUsed / totalCapacity > 0.7
                  ? "bg-amber-500"
                  : "bg-blue-500"
            )}
            style={{ width: `${(totalUsed / totalCapacity) * 100}%` }}
          />
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          {totalCapacity - totalUsed} slots remaining across {stats.binders.length} binders
          (2x 224-disc binders, each with 2x 112-disc sections)
        </p>
      </div>

      {/* Individual binders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {binderData.map(({ binder, movies: binderMovies, categories, used, remaining, percentFull }) => (
          <div
            key={binder.id}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedBinder(expandedBinder === binder.id ? null : binder.id)
              }
              className="w-full p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white",
                    binder.name === "Laughs"
                      ? "bg-amber-500"
                      : binder.name === "Thrills"
                        ? "bg-red-500"
                        : "bg-zinc-500"
                  )}
                >
                  {binder.name[0]}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {binder.label || binder.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {categories.length} categories · {used} discs
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <div className="text-sm font-medium">
                    {remaining} <span className="text-zinc-400 font-normal">left</span>
                  </div>
                  <div className="w-20 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        percentFull > 90
                          ? "bg-red-500"
                          : percentFull > 70
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      )}
                      style={{ width: `${percentFull}%` }}
                    />
                  </div>
                </div>
                {expandedBinder === binder.id ? (
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                )}
              </div>
            </button>

            {expandedBinder === binder.id && (
              <div className="border-t border-zinc-100 dark:border-zinc-800">
                {categories.map(([category, catMovies]) => (
                  <div key={category} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                    <button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === `${binder.id}-${category}`
                            ? null
                            : `${binder.id}-${category}`
                        )
                      }
                      className="w-full px-5 py-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {category}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {catMovies.length} disc{catMovies.length !== 1 ? "s" : ""}
                      </span>
                    </button>

                    {expandedCategory === `${binder.id}-${category}` && (
                      <div className="px-5 pb-3 space-y-1">
                        {catMovies.map((movie) => (
                          <Link
                            key={movie.id}
                            href={`/movie/${movie.id}`}
                            className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Disc3 className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-zinc-700 dark:text-zinc-300">
                              {movie.title}
                            </span>
                            <span className="text-xs text-zinc-400 ml-auto">
                              {movie.medium}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Unassigned movies */}
      {unassigned.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-amber-800 dark:text-amber-400">
              Unassigned Movies ({unassigned.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {unassigned.map((movie) => (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg text-sm hover:bg-amber-100/50 dark:hover:bg-amber-800/20 transition-colors"
              >
                <Film className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-zinc-700 dark:text-zinc-300 truncate">
                  {movie.title}
                </span>
                <span className="text-xs text-zinc-400 ml-auto flex-shrink-0">
                  {movie.medium}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

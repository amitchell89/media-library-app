"use client";

import { cn } from "@/lib/utils";
import { Film, Disc3 } from "lucide-react";
import Link from "next/link";
import type { Movie } from "@/db/schema";

const mediumColors: Record<string, string> = {
  "4K": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "Blu-ray": "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  DVD: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  Digital: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  "Ultra HD DVD": "bg-red-500/15 text-red-700 dark:text-red-400",
};

const genreColors: Record<string, string> = {
  Action: "bg-red-500/10 text-red-700 dark:text-red-400",
  Animation: "bg-green-500/10 text-green-700 dark:text-green-400",
  Comedy: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  Crime: "bg-slate-500/10 text-slate-700 dark:text-slate-400",
  Documentary: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  Drama: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  Fantasy: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  Horror: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  "Sci-Fi": "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  War: "bg-stone-500/10 text-stone-700 dark:text-stone-400",
  Western: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
};

const statusConfig: Record<string, { label: string; color: string }> = {
  "1 - Owned": { label: "Owned", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  "1 - Shipped": { label: "Shipped", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  "2 - Buy Next": { label: "Buy Next", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  "2 - High": { label: "High Priority", color: "bg-orange-500/15 text-orange-700 dark:text-orange-400" },
  "3 - Medium": { label: "Medium", color: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
  "4 - Low": { label: "Low", color: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
  "5 - Skip": { label: "Skip", color: "bg-zinc-500/10 text-zinc-400 dark:text-zinc-500" },
};

function isOwned(status: string) {
  return status === "1 - Owned" || status === "1 - Shipped";
}

export function MovieCard({ movie }: { movie: Movie }) {
  const owned = isOwned(movie.status);
  const statusInfo = statusConfig[movie.status];

  return (
    <Link
      href={`/movie/${movie.id}`}
      className={cn(
        "group block rounded-xl border p-4 transition-all hover:shadow-lg hover:-translate-y-0.5",
        owned
          ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
          : "border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-600"
      )}
    >
      <div className="flex gap-4">
        <div className={cn(
          "flex-shrink-0 w-16 h-24 rounded-lg flex items-center justify-center overflow-hidden",
          owned ? "bg-zinc-100 dark:bg-zinc-800" : "bg-zinc-100/50 dark:bg-zinc-800/50"
        )}>
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Film className={cn("w-8 h-8", owned ? "text-zinc-400" : "text-zinc-300 dark:text-zinc-600")} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {movie.title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {movie.year}
            {movie.director && ` · ${movie.director}`}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {!owned && statusInfo && (
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusInfo.color)}>
                {statusInfo.label}
              </span>
            )}
            {movie.medium && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  mediumColors[movie.medium] || "bg-zinc-100 text-zinc-600"
                )}
              >
                <Disc3 className="w-3 h-3" />
                {movie.medium}
              </span>
            )}
            {movie.genre && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  genreColors[movie.genre] || "bg-zinc-100 text-zinc-600"
                )}
              >
                {movie.genre}
              </span>
            )}
          </div>

          {movie.tomatometer !== null && (
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-0.5">
                🍅 {movie.tomatometer}%
              </span>
              {movie.popcornmeter !== null && (
                <span className="flex items-center gap-0.5">
                  🍿 {movie.popcornmeter}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

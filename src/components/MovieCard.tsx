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

export const priorityConfig: Record<string, { label: string; color: string }> = {
  "Buy Next": { label: "Buy Next", color: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  High: { label: "High", color: "bg-orange-500/15 text-orange-700 dark:text-orange-400" },
  Medium: { label: "Medium", color: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
  Low: { label: "Low", color: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400" },
  Skip: { label: "Skip", color: "bg-zinc-500/10 text-zinc-400 dark:text-zinc-500" },
};

export const priorities = ["Buy Next", "High", "Medium", "Low", "Skip"];
export const formats = ["4K", "Blu-ray", "DVD", "Digital"];

export function isOwned(movie: Movie) {
  return movie.status === "owned";
}

export function isWishlist(movie: Movie) {
  return movie.status === "wishlist";
}

export function MovieCard({ movie }: { movie: Movie }) {
  const owned = isOwned(movie);

  return (
    <div
      className={cn(
        "group relative rounded-xl border transition-all",
        owned
          ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          : "border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-100/60 dark:bg-zinc-900/40"
      )}
    >
      <Link href={`/movie/${movie.id}`} className="block p-4">
        <div className="flex gap-4">
          <div className={cn(
            "flex-shrink-0 w-16 h-24 rounded-lg flex items-center justify-center overflow-hidden",
            owned ? "bg-zinc-100 dark:bg-zinc-800" : "bg-zinc-200/50 dark:bg-zinc-800/30"
          )}>
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className={cn("w-full h-full object-cover", !owned && "opacity-60")}
              />
            ) : (
              <Film className={cn("w-8 h-8", owned ? "text-zinc-400" : "text-zinc-300 dark:text-zinc-600")} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors",
              owned ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
            )}>
              {movie.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {movie.year}
              {movie.director && ` · ${movie.director}`}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {!owned && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-700 dark:text-blue-400">
                  Wishlist
                </span>
              )}
              {!owned && movie.wishlistPriority && (
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", priorityConfig[movie.wishlistPriority]?.color)}>
                  {priorityConfig[movie.wishlistPriority]?.label || movie.wishlistPriority}
                </span>
              )}
              {!owned && movie.preferredFormat && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  mediumColors[movie.preferredFormat] || "bg-zinc-100 text-zinc-600"
                )}>
                  <Disc3 className="w-3 h-3" />
                  {movie.preferredFormat}
                </span>
              )}
              {owned && movie.medium && (
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
    </div>
  );
}

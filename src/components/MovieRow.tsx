"use client";

import { cn } from "@/lib/utils";
import { Film } from "lucide-react";
import Link from "next/link";
import type { Movie } from "@/db/schema";
import { statusConfig, isOwned } from "./MovieCard";

const allStatuses = ["1 - Owned", "1 - Shipped", "2 - Buy Next", "2 - High", "3 - Medium", "4 - Low", "5 - Skip"];

export function MovieRow({ movie, onStatusChange }: { movie: Movie; onStatusChange?: (id: number, status: string) => void }) {
  const owned = isOwned(movie.status);
  const statusInfo = statusConfig[movie.status];

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-lg border transition-all",
        owned
          ? "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          : "border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-100/60 dark:bg-zinc-900/40"
      )}
    >
      <Link href={`/movie/${movie.id}`} className="flex-shrink-0 w-8 h-12 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt="" className={cn("w-full h-full object-cover", !owned && "opacity-60")} />
        ) : (
          <Film className="w-4 h-4 text-zinc-400" />
        )}
      </Link>

      <Link href={`/movie/${movie.id}`} className="flex-1 min-w-0 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <span className={cn(
            "font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate block",
            owned ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400"
          )}>
            {movie.title}
          </span>
        </div>

        <span className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 w-12 text-right tabular-nums">
          {movie.year || "—"}
        </span>

        <span className="hidden md:block text-xs text-zinc-500 dark:text-zinc-400 w-32 truncate">
          {movie.director || "—"}
        </span>

        <span className="hidden lg:block text-xs text-zinc-500 dark:text-zinc-400 w-20 truncate">
          {movie.genre || "—"}
        </span>

        <span className="hidden lg:block text-xs text-zinc-500 dark:text-zinc-400 w-16">
          {movie.medium || "—"}
        </span>

        {movie.tomatometer !== null ? (
          <span className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 w-14 text-right tabular-nums">
            🍅 {movie.tomatometer}%
          </span>
        ) : (
          <span className="hidden sm:block w-14" />
        )}
      </Link>

      {onStatusChange ? (
        <select
          value={movie.status}
          onChange={(e) => onStatusChange(movie.id, e.target.value)}
          className={cn(
            "w-24 px-1.5 py-1 rounded border text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40",
            owned
              ? "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
              : "border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800"
          )}
        >
          {allStatuses.map((s) => (
            <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
          ))}
        </select>
      ) : (
        <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap", statusInfo?.color)}>
          {statusInfo?.label}
        </span>
      )}
    </div>
  );
}

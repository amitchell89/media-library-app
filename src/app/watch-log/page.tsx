"use client";

import { useEffect, useState } from "react";
import { Eye, Calendar, Star, Film } from "lucide-react";
import Link from "next/link";
import type { WatchLogEntry } from "@/db/schema";

export default function WatchLogPage() {
  const [entries, setEntries] = useState<WatchLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/watch-log")
      .then((r) => r.json() as Promise<WatchLogEntry[]>)
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Eye className="w-6 h-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Watch Log</h1>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Track movies you and your wife watch together. Log a watch from any
        movie&apos;s detail page.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Film className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 dark:text-zinc-400 mb-1">No watches logged yet</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Go to a movie&apos;s detail page and click &quot;Log Watch&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <div className="flex-1 min-w-0">
                {entry.movieId ? (
                  <Link
                    href={`/movie/${entry.movieId}`}
                    className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {entry.title}
                  </Link>
                ) : (
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {entry.title}
                  </span>
                )}
                <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(entry.watchedAt).toLocaleDateString()}
                  </span>
                  {entry.watchedBy && (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs">
                      {entry.watchedBy}
                    </span>
                  )}
                </div>
              </div>
              {entry.rating && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-medium">{entry.rating}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

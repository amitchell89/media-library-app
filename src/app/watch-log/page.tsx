"use client";

import { useEffect, useState, useRef } from "react";
import { Eye, Calendar, Star, Film, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StarDisplay, StarInput } from "@/components/StarRating";

function displayWatcher(val: string) {
  return val === "Wife" ? "Georgia" : val;
}

interface WatchEntry {
  id: number;
  movieId: number | null;
  tmdbId: number | null;
  title: string | null;
  watchedBy: string | null;
  watchedAt: string;
  rating: number | null;
  notes: string | null;
  source: string | null;
  createdAt: string | null;
  posterUrl: string | null;
}

interface TmdbResult {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  overview: string | null;
  voteAverage: number | null;
}

export default function WatchLogPage() {
  const [entries, setEntries] = useState<WatchEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchEntries = () => {
    fetch("/api/watch-log")
      .then((r) => r.json() as Promise<WatchEntry[]>)
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleLogged = () => {
    setShowModal(false);
    fetchEntries();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Watch Log</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Movie
        </button>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        {entries.length} movie{entries.length !== 1 ? "s" : ""} watched
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
            Click &quot;Log Movie&quot; to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const link = entry.movieId
              ? `/movie/${entry.movieId}`
              : entry.tmdbId
                ? `/movie/tmdb/${entry.tmdbId}`
                : null;

            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                {link ? (
                  <Link href={link} className="flex-shrink-0 w-10 h-[60px] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {entry.posterUrl ? (
                      <img src={entry.posterUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Film className="w-5 h-5 text-zinc-400" />
                    )}
                  </Link>
                ) : (
                  <div className="flex-shrink-0 w-10 h-[60px] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    <Film className="w-5 h-5 text-zinc-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {link ? (
                    <Link
                      href={link}
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
                        {displayWatcher(entry.watchedBy)}
                      </span>
                    )}
                  </div>
                </div>
                {entry.rating != null && entry.rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <StarDisplay value={entry.rating} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <LogMovieModal
          onClose={() => setShowModal(false)}
          onLogged={handleLogged}
        />
      )}
    </div>
  );
}

function LogMovieModal({
  onClose,
  onLogged,
}: {
  onClose: () => void;
  onLogged: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<TmdbResult | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [watchedAt, setWatchedAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [watchedBy, setWatchedBy] = useState("both");
  const [saving, setSaving] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as TmdbResult[];
      setResults(data);
      setSearching(false);
    }, 300);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/watch-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: selected.title,
        tmdbId: selected.tmdbId,
        watchedBy,
        watchedAt,
        rating: rating > 0 ? rating : null,
      }),
    });
    setSaving(false);
    onLogged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Log Movie</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {!selected ? (
          <div className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for a movie..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {searching && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
              </div>
            )}

            {!searching && results.length > 0 && (
              <div className="max-h-80 overflow-y-auto space-y-1">
                {results.map((r) => (
                  <button
                    key={r.tmdbId}
                    onClick={() => setSelected(r)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-12 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      {r.posterUrl ? (
                        <img src={r.posterUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate block">
                        {r.title}
                      </span>
                      <span className="text-xs text-zinc-500">{r.year || "Unknown year"}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!searching && query && results.length === 0 && (
              <p className="text-center text-sm text-zinc-400 py-8">No results found</p>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-18 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                {selected.posterUrl ? (
                  <img src={selected.posterUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-6 h-6 text-zinc-400" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{selected.title}</h3>
                <p className="text-sm text-zinc-500">{selected.year}</p>
              </div>
              <button
                onClick={() => { setSelected(null); setRating(0); setHoverRating(0); }}
                className="ml-auto text-sm text-blue-500 hover:text-blue-600"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Rating
              </label>
              <StarInput value={rating} hoverValue={hoverRating} onChange={setRating} onHover={setHoverRating} size="lg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={watchedAt}
                  onChange={(e) => setWatchedAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Watched by
                </label>
                <select
                  value={watchedBy}
                  onChange={(e) => setWatchedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="both">Both</option>
                  <option value="Aaron">Aaron</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Log Watch"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

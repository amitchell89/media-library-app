"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Film,
  Disc3,
  Eye,
  Star,
  User,
  Award,
  Monitor,
  Speaker,
  FolderOpen,
  Tag,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StarDisplay, StarInput } from "@/components/StarRating";
import { priorityConfig, priorities, formats } from "@/components/MovieCard";
import type { Movie, Binder, WatchLogEntry } from "@/db/schema";

const mediumColors: Record<string, string> = {
  "4K": "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "Blu-ray": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  DVD: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
  Digital: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
};

interface TmdbExtra {
  overview: string | null;
  tagline: string | null;
  runtime: number | null;
  voteAverage: number | null;
  genres: string[];
  cast: string[];
}

function displayWatcher(val: string) {
  return val === "Wife" ? "Georgia" : val;
}

export default function MovieDetail() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<(Movie & { binder: Binder | null; watches: WatchLogEntry[] }) | null>(null);
  const [tmdb, setTmdb] = useState<TmdbExtra | null>(null);
  const [showWatchForm, setShowWatchForm] = useState(false);
  const [watchedBy, setWatchedBy] = useState("both");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    fetch(`/api/movies/${params.id}`)
      .then((r) => r.json() as Promise<Movie & { binder: Binder | null; watches: WatchLogEntry[] }>)
      .then((data) => {
        setMovie(data);
        if (data.tmdbId) {
          fetch(`/api/tmdb/movie/${data.tmdbId}`)
            .then((r) => r.json() as Promise<TmdbExtra>)
            .then(setTmdb);
        }
      });
  }, [params.id]);

  if (!movie) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const owned = movie.status === "owned";

  const handleLogWatch = async () => {
    const res = await fetch("/api/watch-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movieId: movie.id,
        title: movie.title,
        watchedBy,
        watchedAt: new Date().toISOString().split("T")[0],
        rating: rating > 0 ? rating : null,
        tmdbId: movie.tmdbId,
      }),
    });
    const entry = await res.json() as WatchLogEntry;
    setMovie({ ...movie, watches: [entry, ...movie.watches] });
    setShowWatchForm(false);
    setRating(0);
    setHoverRating(0);
  };

  const updateMovie = async (fields: Record<string, unknown>) => {
    await fetch(`/api/movies/${movie.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setMovie({ ...movie, ...fields } as typeof movie);
  };

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const latestRating = movie.watches.find((w) => w.rating != null && w.rating > 0);

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-24 h-36 sm:w-32 sm:h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
              {movie.posterUrl ? (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Film className="w-12 h-12 text-zinc-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                {movie.title}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-lg text-zinc-500 dark:text-zinc-400">
                {movie.year && <span>{movie.year}</span>}
                {tmdb?.runtime && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-600">|</span>
                    <span className="flex items-center gap-1 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRuntime(tmdb.runtime)}
                    </span>
                  </>
                )}
              </div>

              {tmdb?.tagline && (
                <p className="text-sm italic text-zinc-400 dark:text-zinc-500 mt-2">
                  &ldquo;{tmdb.tagline}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {movie.genre && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                    {movie.genre}
                  </span>
                )}
                {movie.subgenre && movie.subgenre !== movie.genre && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {movie.subgenre}
                  </span>
                )}
                {movie.criterionCollection && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    Criterion Collection
                  </span>
                )}
              </div>

              {/* Ratings */}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {latestRating && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">My</span>
                    <StarDisplay value={latestRating.rating!} />
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {latestRating.rating}
                    </span>
                  </div>
                )}
                {movie.tomatometer !== null && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🍅</span>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {movie.tomatometer}%
                    </span>
                  </div>
                )}
                {movie.popcornmeter !== null && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🍿</span>
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {movie.popcornmeter}%
                    </span>
                  </div>
                )}
                {tmdb?.voteAverage != null && tmdb.voteAverage > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                      {tmdb.voteAverage.toFixed(1)}
                    </span>
                    <span className="text-sm text-zinc-400">/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overview */}
        {tmdb?.overview && (
          <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {tmdb.overview}
            </p>
          </div>
        )}

        {/* Status & Format Selectors */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={movie.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  if (newStatus === "owned") {
                    updateMovie({ status: "owned", wishlistPriority: null });
                  } else {
                    updateMovie({ status: "wishlist", wishlistPriority: movie.wishlistPriority || "Medium" });
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="owned">Owned</option>
                <option value="wishlist">Wishlist</option>
              </select>
            </div>

            {owned ? (
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                  Format
                </label>
                <select
                  value={movie.medium || ""}
                  onChange={(e) => updateMovie({ medium: e.target.value || null })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="">Not set</option>
                  {formats.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Priority
                  </label>
                  <select
                    value={movie.wishlistPriority || "Medium"}
                    onChange={(e) => updateMovie({ wishlistPriority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>{priorityConfig[p]?.label || p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                    Preferred Format
                  </label>
                  <select
                    value={movie.preferredFormat || ""}
                    onChange={(e) => updateMovie({ preferredFormat: e.target.value || null })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="">Any</option>
                    {formats.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {movie.director && (
            <DetailRow icon={User} label="Director" value={movie.director} />
          )}
          {movie.leadActors && (
            <DetailRow icon={Star} label="Lead Actors" value={movie.leadActors} />
          )}
          {movie.awards && (
            <DetailRow icon={Award} label="Awards" value={movie.awards} />
          )}
          {movie.visuals && (
            <DetailRow icon={Monitor} label="Visuals" value={movie.visuals} />
          )}
          {movie.sound && (
            <DetailRow icon={Speaker} label="Sound" value={movie.sound} />
          )}
          {movie.binder && (
            <DetailRow
              icon={FolderOpen}
              label="Binder"
              value={`${movie.binder.label || movie.binder.name}${movie.binderCategory ? ` / ${movie.binderCategory}` : ""}`}
            />
          )}
        </div>

        {/* Watch History */}
        {movie.watches.length > 0 && (
          <div className="p-6 sm:p-8 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
              Watch History
            </h3>
            <div className="space-y-2">
              {movie.watches.map((watch) => (
                <div
                  key={watch.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <Calendar className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">
                    {new Date(watch.watchedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {watch.watchedBy && (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs text-zinc-600 dark:text-zinc-400">
                      {displayWatcher(watch.watchedBy)}
                    </span>
                  )}
                  {watch.rating != null && watch.rating > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      <StarDisplay value={watch.rating} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 sm:p-8 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
          {!showWatchForm ? (
            <button
              onClick={() => setShowWatchForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Log Watch
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Watched by</label>
                  <select
                    value={watchedBy}
                    onChange={(e) => setWatchedBy(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                  >
                    <option value="both">Both</option>
                    <option value="Aaron">Aaron</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Rating</label>
                  <StarInput value={rating} hoverValue={hoverRating} onChange={setRating} onHover={setHoverRating} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogWatch}
                  className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowWatchForm(false); setRating(0); setHoverRating(0); }}
                  className="px-4 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
      <div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm text-zinc-900 dark:text-zinc-100 mt-0.5">
          {value}
        </div>
      </div>
    </div>
  );
}

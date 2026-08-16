"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Film,
  Eye,
  Star,
  User,
  Clock,
  Plus,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TmdbMovie {
  tmdbId: number;
  title: string;
  year: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  overview: string | null;
  tagline: string | null;
  voteAverage: number | null;
  runtime: number | null;
  genres: string[];
  director: string | null;
  cast: string[];
  inLibrary: { id: number; status: string } | null;
}

export default function TmdbMovieDetail() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<TmdbMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWatchForm, setShowWatchForm] = useState(false);
  const [watchedBy, setWatchedBy] = useState("both");
  const [rating, setRating] = useState("");
  const [watchLogged, setWatchLogged] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    fetch(`/api/tmdb/movie/${params.tmdbId}`)
      .then((r) => r.json() as Promise<TmdbMovie>)
      .then((data) => {
        setMovie(data);
        setLoading(false);
      });
  }, [params.tmdbId]);

  if (loading || !movie) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const handleLogWatch = async () => {
    await fetch("/api/watch-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        movieId: movie.inLibrary?.id || null,
        title: movie.title,
        watchedBy,
        watchedAt: new Date().toISOString().split("T")[0],
        rating: rating ? parseFloat(rating) : null,
        tmdbId: movie.tmdbId,
      }),
    });
    setShowWatchForm(false);
    setRating("");
    setWatchLogged(true);
  };

  const handleAddToWishlist = async () => {
    setAddingToWishlist(true);
    const res = await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: movie.title,
        year: movie.year,
        director: movie.director,
        leadActors: movie.cast.join(", "),
        genre: movie.genres[0] || null,
        posterUrl: movie.posterUrl,
        tmdbId: movie.tmdbId,
        status: "3 - Medium",
      }),
    });
    if (res.ok) {
      const created = (await res.json()) as { id: number };
      setMovie({ ...movie, inLibrary: { id: created.id, status: "3 - Medium" } });
    }
    setAddingToWishlist(false);
  };

  const formatRuntime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

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
                {movie.runtime && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-600">|</span>
                    <span className="flex items-center gap-1 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRuntime(movie.runtime)}
                    </span>
                  </>
                )}
              </div>

              {movie.tagline && (
                <p className="text-sm italic text-zinc-400 dark:text-zinc-500 mt-2">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 mt-3">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {movie.voteAverage !== null && movie.voteAverage > 0 && (
                <div className="flex items-center gap-1.5 mt-3">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {movie.voteAverage.toFixed(1)}
                  </span>
                  <span className="text-sm text-zinc-400">/10</span>
                </div>
              )}

              {movie.inLibrary && (
                <Link
                  href={`/movie/${movie.inLibrary.id}`}
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  In your library
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Overview */}
        {movie.overview && (
          <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {movie.overview}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-zinc-100 dark:border-zinc-800">
          {movie.director && (
            <DetailRow icon={User} label="Director" value={movie.director} />
          )}
          {movie.cast.length > 0 && (
            <DetailRow
              icon={Star}
              label="Cast"
              value={movie.cast.join(", ")}
            />
          )}
        </div>

        {/* Actions */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {!showWatchForm && !watchLogged && (
              <button
                onClick={() => setShowWatchForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Log Watch
              </button>
            )}
            {watchLogged && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium">
                <Check className="w-4 h-4" />
                Watch logged
              </span>
            )}
            {!movie.inLibrary && (
              <button
                onClick={handleAddToWishlist}
                disabled={addingToWishlist}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {addingToWishlist ? "Adding..." : "Add to Wishlist"}
              </button>
            )}
          </div>

          {showWatchForm && (
            <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Watched by
                </label>
                <select
                  value={watchedBy}
                  onChange={(e) => setWatchedBy(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                >
                  <option value="both">Both</option>
                  <option value="Aaron">Aaron</option>
                  <option value="Wife">Wife</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Rating (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="Optional"
                  className="w-24 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                />
              </div>
              <button
                onClick={handleLogWatch}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowWatchForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-700"
              >
                Cancel
              </button>
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

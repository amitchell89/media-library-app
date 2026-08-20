"use client";

import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Film } from "lucide-react";
import Link from "next/link";
import type { Movie, Binder } from "@/db/schema";

const BINDER_COLORS: Record<number, { accent: string; accentBg: string; bg: string; divider: string; border: string; tab: string; tabActive: string }> = {
  2: {
    accent: "text-amber-500",
    accentBg: "bg-amber-500",
    bg: "bg-amber-500/10",
    divider: "bg-amber-500/30",
    border: "border-amber-500/30",
    tab: "hover:bg-amber-500/10 text-zinc-500 dark:text-zinc-400",
    tabActive: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500",
  },
  1: {
    accent: "text-teal-500",
    accentBg: "bg-teal-500",
    bg: "bg-teal-500/10",
    divider: "bg-teal-500/30",
    border: "border-teal-500/30",
    tab: "hover:bg-teal-500/10 text-zinc-500 dark:text-zinc-400",
    tabActive: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500",
  },
  3: {
    accent: "text-rose-500",
    accentBg: "bg-rose-500",
    bg: "bg-rose-500/10",
    divider: "bg-rose-500/30",
    border: "border-rose-500/30",
    tab: "hover:bg-rose-500/10 text-zinc-500 dark:text-zinc-400",
    tabActive: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500",
  },
};

const BINDER_ORDER = [2, 1, 3];

const SECTION_ORDER: Record<number, string[]> = {
  1: [
    "Quentin Tarantino", "Martin Scorsese", "Stanley Kubrick", "Christopher Nolan", "Steven Spielberg",
    "Star Wars", "Alien Universe", "Jurassic Park", "Planet of the Apes", "Back to the Future", "Star Trek",
    "80s & 90s Sci Fi", "80s & 90s Sci-Fi", "Mindfuck", "Modern Sci-Fi",
    "Harry Potter", "Lord of the Rings", "Fantasy",
    "Modern Horror", "Premium Horror", "Classic Horror", "Zombies", "Creature Horror", "Cult Horror",
  ],
  2: [
    "Will Ferrell", "2000s Comedy", "90s Comedy", "80s Comedy", "Ghostbusters", "Eighties Classics",
    "Kevin Smith", "Christopher Guest", "Wes Anderson",
    "Music", "Nicholas Cage", "Georgia", "Dark Comedy", "Classic Comedy",
    "Disney", "Other Animation",
  ],
  3: [
    "Batman", "Superhero", "Indiana Jones", "Rocky", "John Wick", "James Bond",
    "Kung Fu", "80s & 90s Action", "Modern Action",
    "David Fincher", "Big Crime", "Financial Movie", "Cinema Classic",
    "TNT Drama", "Paul Thomas Anderson", "Modern Drama", "Sports Drama",
    "Patriots", "War",
    "Music", "Documentary",
  ],
};

const FRANCHISE_CLUSTERS = new Set([
  "Star Wars", "Alien Universe", "Jurassic Park", "Planet of the Apes",
  "Back to the Future", "Star Trek", "Harry Potter", "Lord of the Rings",
  "Batman", "Indiana Jones", "Rocky", "John Wick", "James Bond", "Ghostbusters",
]);

const SECTION_LABELS: Record<string, string> = {
  "Quentin Tarantino": "Directors",
};

function sectionGroupKey(category: string): string | null {
  const directors = ["Quentin Tarantino", "Martin Scorsese", "Stanley Kubrick", "Christopher Nolan", "Steven Spielberg"];
  if (directors.includes(category)) return "Directors";
  return null;
}

function sortMoviesInCluster(movies: Movie[], isFranchise: boolean): Movie[] {
  return [...movies].sort((a, b) => {
    if (isFranchise) {
      return (a.year || 0) - (b.year || 0);
    }
    const a4k = a.medium === "4K" ? 0 : 1;
    const b4k = b.medium === "4K" ? 0 : 1;
    if (a4k !== b4k) return a4k - b4k;
    return (a.year || 0) - (b.year || 0);
  });
}

export default function BindersPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [binders, setBinders] = useState<Binder[]>([]);
  const [activeBinder, setActiveBinder] = useState<number>(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/movies?status=owned").then((r) => r.json() as Promise<Movie[]>),
      fetch("/api/movies/stats").then((r) => r.json() as Promise<{ binders: Binder[] }>),
    ]).then(([moviesData, statsData]) => {
      setMovies(moviesData);
      setBinders(statsData.binders);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const binderSections = useMemo(() => {
    const result: Record<number, { category: string; movies: Movie[] }[]> = {};

    for (const binderId of BINDER_ORDER) {
      const binderMovies = movies.filter((m) => m.binderId === binderId);
      const grouped: Record<string, Movie[]> = {};

      for (const movie of binderMovies) {
        const cat = movie.binderCategory || "Other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(movie);
      }

      const order = SECTION_ORDER[binderId] || [];
      const ordered: { category: string; movies: Movie[] }[] = [];
      const seen = new Set<string>();

      for (const cat of order) {
        if (grouped[cat]) {
          ordered.push({
            category: cat,
            movies: sortMoviesInCluster(grouped[cat], FRANCHISE_CLUSTERS.has(cat)),
          });
          seen.add(cat);
        }
      }

      for (const cat of Object.keys(grouped).sort()) {
        if (!seen.has(cat)) {
          ordered.push({
            category: cat,
            movies: sortMoviesInCluster(grouped[cat], FRANCHISE_CLUSTERS.has(cat)),
          });
        }
      }

      result[binderId] = ordered;
    }

    return result;
  }, [movies]);

  const activeSections = binderSections[activeBinder] || [];
  const activeCount = movies.filter((m) => m.binderId === activeBinder).length;
  const colors = BINDER_COLORS[activeBinder] || BINDER_COLORS[2];

  const sectionsWithHeaders = useMemo(() => {
    let lastGroup: string | null = null;
    return activeSections.map(({ category, movies: sectionMovies }) => {
      const groupLabel = sectionGroupKey(category);
      let showGroupHeader = false;
      if (groupLabel && groupLabel !== lastGroup) {
        lastGroup = groupLabel;
        showGroupHeader = true;
      } else if (!groupLabel && lastGroup) {
        lastGroup = null;
      }
      return { category, movies: sectionMovies, showGroupHeader, groupLabel };
    });
  }, [activeSections]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Binder Layout</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          {movies.length} discs across 3 binders &middot; 672 total slots
        </p>
      </div>

      {/* Binder tabs */}
      <div className="flex gap-2">
        {BINDER_ORDER.map((binderId, idx) => {
          const binder = binders.find((b) => b.id === binderId);
          const count = movies.filter((m) => m.binderId === binderId).length;
          const c = BINDER_COLORS[binderId];
          const isActive = activeBinder === binderId;

          return (
            <button
              key={binderId}
              onClick={() => setActiveBinder(binderId)}
              className={cn(
                "flex-1 px-3 py-3 rounded-xl border-2 transition-all text-left",
                isActive
                  ? `${c.tabActive} border-current`
                  : `${c.tab} border-transparent`
              )}
            >
              <div className="text-xs font-medium uppercase tracking-wider opacity-60">
                Binder {idx + 1}
              </div>
              <div className="text-sm font-semibold mt-0.5 truncate">
                {binder?.name || `Binder ${idx + 1}`}
              </div>
              <div className="text-xs mt-1 opacity-70">
                {count} / 224
              </div>
            </button>
          );
        })}
      </div>

      {/* Capacity bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", colors.accentBg)}
            style={{ width: `${(activeCount / 224) * 100}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500 font-medium tabular-nums">
          {activeCount}/224 ({Math.round((activeCount / 224) * 100)}%)
        </span>
      </div>

      {/* Binder contents */}
      <div className="space-y-6">
        {sectionsWithHeaders.map(({ category, movies: sectionMovies, showGroupHeader, groupLabel }) => (
          <div key={category}>
            {showGroupHeader && groupLabel && (
              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className={cn("h-px flex-1", colors.divider)} />
                <span className={cn("text-xs font-bold uppercase tracking-widest", colors.accent)}>
                  {groupLabel}
                </span>
                <div className={cn("h-px flex-1", colors.divider)} />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {category}
                </h3>
                <span className="text-xs text-zinc-400 tabular-nums">
                  {sectionMovies.length}
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {sectionMovies.map((movie) => (
                  <MovieSlot key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MovieSlot({ movie }: { movie: Movie }) {
  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all hover:scale-105"
      title={`${movie.title} (${movie.year})${movie.medium ? ` — ${movie.medium}` : ""}`}
    >
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
          <Film className="w-4 h-4 text-zinc-400" />
          <span className="text-[8px] text-zinc-400 text-center leading-tight line-clamp-2">
            {movie.title}
          </span>
        </div>
      )}

      {movie.medium === "4K" && (
        <span className="absolute top-0.5 right-0.5 px-1 py-px rounded text-[7px] font-bold bg-amber-400 text-amber-900 leading-none">
          4K
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-1.5 pt-4">
        <span className="text-[9px] text-white font-medium leading-tight line-clamp-2 block">
          {movie.title}
        </span>
        <span className="text-[8px] text-white/60">{movie.year}</span>
      </div>
    </Link>
  );
}

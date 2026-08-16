import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  const { tmdbId: tmdbIdStr } = await params;
  const tmdbId = parseInt(tmdbIdStr);

  const { env } = await getCloudflareContext({ async: true });
  const apiKey = env.TMDB_API_KEY || process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  const [movieRes, creditsRes] = await Promise.all([
    fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${apiKey}`
    ),
    fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}/credits?api_key=${apiKey}`
    ),
  ]);

  if (!movieRes.ok) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  const movie = (await movieRes.json()) as {
    id: number;
    title: string;
    release_date?: string;
    poster_path?: string;
    backdrop_path?: string;
    overview?: string;
    vote_average?: number;
    runtime?: number;
    genres?: Array<{ id: number; name: string }>;
    tagline?: string;
  };

  const credits = creditsRes.ok
    ? ((await creditsRes.json()) as {
        cast?: Array<{ name: string; character: string; order: number }>;
        crew?: Array<{ name: string; job: string }>;
      })
    : { cast: [], crew: [] };

  const director = credits.crew?.find((c) => c.job === "Director")?.name || null;
  const cast = credits.cast?.slice(0, 6).map((c) => c.name) || [];

  const db = getDb(env.DB);
  const existing = await db
    .select({ id: schema.movies.id, status: schema.movies.status })
    .from(schema.movies)
    .where(eq(schema.movies.tmdbId, tmdbId))
    .limit(1);

  return NextResponse.json({
    tmdbId: movie.id,
    title: movie.title,
    year: movie.release_date
      ? parseInt(movie.release_date.substring(0, 4))
      : null,
    posterUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
      : null,
    backdropUrl: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
      : null,
    overview: movie.overview || null,
    tagline: movie.tagline || null,
    voteAverage: movie.vote_average || null,
    runtime: movie.runtime || null,
    genres: movie.genres?.map((g) => g.name) || [],
    director,
    cast,
    inLibrary: existing.length > 0 ? existing[0] : null,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json([]);
  }

  const { env } = await getCloudflareContext({ async: true });
  const apiKey = env.TMDB_API_KEY || process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`
  );
  const data = (await res.json()) as {
    results: Array<{
      id: number;
      title: string;
      release_date?: string;
      poster_path?: string;
      overview?: string;
      vote_average?: number;
      genre_ids?: number[];
    }>;
  };

  const results = data.results.map((m) => ({
    tmdbId: m.id,
    title: m.title,
    year: m.release_date ? parseInt(m.release_date.substring(0, 4)) : null,
    posterUrl: m.poster_path
      ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
      : null,
    overview: m.overview || null,
    voteAverage: m.vote_average || null,
  }));

  return NextResponse.json(results);
}

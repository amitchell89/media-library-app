import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^(\w+)=(.+)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  console.error("Set TMDB_API_KEY in .env.local or as env var.");
  process.exit(1);
}

const DB_PATH = path.join(process.cwd(), "media-library.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w342";
const BATCH_DELAY_MS = 260;

interface TmdbResult {
  id: number;
  poster_path: string | null;
  title: string;
  release_date?: string;
}

async function searchMovie(title: string, year: number | null): Promise<TmdbResult | null> {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY!,
    query: title,
  });
  if (year) params.set("year", String(year));

  const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`);
  if (!res.ok) {
    console.error(`  TMDB error ${res.status} for "${title}"`);
    return null;
  }
  const data = (await res.json()) as { results?: TmdbResult[] };
  if (!data.results?.length) {
    if (year) return searchMovie(title, null);
    return null;
  }
  return data.results[0];
}

async function main() {
  const movies = sqlite
    .prepare("SELECT id, title, year, poster_url, tmdb_id FROM movies WHERE poster_url IS NULL OR poster_url = ''")
    .all() as Array<{ id: number; title: string; year: number | null; poster_url: string | null; tmdb_id: number | null }>;

  console.log(`Found ${movies.length} movies without posters`);

  const update = sqlite.prepare("UPDATE movies SET poster_url = ?, tmdb_id = ?, updated_at = datetime('now') WHERE id = ?");

  let found = 0;
  let notFound = 0;

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const cleanTitle = movie.title
      .replace(/\s*\(\d{4}\)\s*$/, "")
      .replace(/\s*-\s*Criterion\s*$/i, "");

    const result = await searchMovie(cleanTitle, movie.year);

    if (result?.poster_path) {
      const posterUrl = `${TMDB_IMAGE_BASE}${result.poster_path}`;
      update.run(posterUrl, result.id, movie.id);
      found++;
      console.log(`  [${i + 1}/${movies.length}] ✓ ${movie.title}`);
    } else {
      notFound++;
      console.log(`  [${i + 1}/${movies.length}] ✗ ${movie.title}`);
    }

    await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
  }

  console.log(`\nDone: ${found} posters found, ${notFound} not found`);
  sqlite.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import fs from "fs";
import path from "path";

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf-8")
);

function esc(val: string | null | undefined): string {
  if (val == null || val === "") return "NULL";
  return "'" + String(val).replace(/'/g, "''") + "'";
}

const lines: string[] = [];

const binderNames: string[] = [...new Set(seedData.map((m: any) => m.binder).filter(Boolean) as string[])];
const binderMap: Record<string, number> = {};
let binderId = 1;

for (const binderLabel of binderNames) {
  const name = (binderLabel as string).replace(/^\d+ - /, "");
  lines.push(
    `INSERT INTO binders (id, name, label, capacity, sections) VALUES (${binderId}, ${esc(name)}, ${esc(binderLabel)}, 224, 2);`
  );
  binderMap[binderLabel] = binderId;
  binderId++;
}

for (const movie of seedData) {
  const bId = movie.binder ? binderMap[movie.binder] || "NULL" : "NULL";
  lines.push(
    `INSERT INTO movies (title, year, director, lead_actors, genre, subgenre, medium, visuals, sound, awards, tomatometer, popcornmeter, criterion_collection, status, binder_id, binder_category, poster_url, tmdb_id) VALUES (${esc(movie.title)}, ${movie.year || "NULL"}, ${esc(movie.director)}, ${esc(movie.leadActors)}, ${esc(movie.genre)}, ${esc(movie.subgenre)}, ${esc(movie.medium)}, ${esc(movie.visuals)}, ${esc(movie.sound)}, ${esc(movie.awards)}, ${movie.tomatometer ?? "NULL"}, ${movie.popcornmeter ?? "NULL"}, ${movie.criterionCollection ? 1 : 0}, ${esc(movie.status || "1 - Owned")}, ${bId}, ${esc(movie.binderCategory)}, ${esc(movie.posterUrl)}, ${movie.tmdbId || "NULL"});`
  );
}

const outPath = path.join(process.cwd(), "migrations", "0002_seed.sql");
fs.writeFileSync(outPath, lines.join("\n") + "\n");
console.log(`Generated ${lines.length} SQL statements → ${outPath}`);

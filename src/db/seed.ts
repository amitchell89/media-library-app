import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "media-library.db");
const forceFlag = process.argv.includes("--force");

if (!fs.existsSync(DB_PATH)) {
  console.log("No database found. Run `npm run db:migrate` first.");
  process.exit(1);
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const existing = sqlite.prepare("SELECT COUNT(*) as count FROM movies").get() as { count: number };
if (existing.count > 0 && !forceFlag) {
  console.log(`Database already has ${existing.count} movies. Skipping seed to protect existing data.`);
  console.log("Use --force to overwrite: npm run db:seed -- --force");
  sqlite.close();
  process.exit(0);
}

if (existing.count > 0 && forceFlag) {
  console.log(`WARNING: Overwriting ${existing.count} existing movies...`);
  sqlite.exec("DELETE FROM watch_log");
  sqlite.exec("DELETE FROM movies");
  sqlite.exec("DELETE FROM binders");
}

const seedData: Array<{
  title: string;
  status: string;
  medium: string;
  visuals: string | null;
  sound: string | null;
  genre: string;
  subgenre: string;
  year: number | null;
  director: string;
  leadActors: string;
  awards: string | null;
  tomatometer: number | null;
  popcornmeter: number | null;
  binderCategory: string | null;
  binder: string;
  criterionCollection: boolean;
}> = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf-8")
);

const binderMap: Record<string, number> = {};
const binderNames = [...new Set(seedData.map((m) => m.binder).filter(Boolean))];

const insertBinder = sqlite.prepare(
  "INSERT INTO binders (name, label, capacity, sections) VALUES (?, ?, 224, 2)"
);

for (const binderLabel of binderNames) {
  const name = binderLabel.replace(/^\d+ - /, "");
  const result = insertBinder.run(name, binderLabel);
  binderMap[binderLabel] = Number(result.lastInsertRowid);
}
console.log("Inserted binders:", binderMap);

const insertMovie = sqlite.prepare(`
  INSERT INTO movies (title, year, director, lead_actors, genre, subgenre, medium, visuals, sound, awards, tomatometer, popcornmeter, criterion_collection, status, binder_id, binder_category)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAll = sqlite.transaction(() => {
  for (const movie of seedData) {
    insertMovie.run(
      movie.title,
      movie.year,
      movie.director,
      movie.leadActors,
      movie.genre,
      movie.subgenre,
      movie.medium,
      movie.visuals,
      movie.sound,
      movie.awards,
      movie.tomatometer,
      movie.popcornmeter,
      movie.criterionCollection ? 1 : 0,
      movie.status || "1 - Owned",
      movie.binder ? binderMap[movie.binder] || null : null,
      movie.binderCategory
    );
  }
});

insertAll();
console.log(`Seeded ${seedData.length} movies`);
sqlite.close();

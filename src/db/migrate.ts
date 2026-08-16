import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "media-library.db");
const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS binders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    label TEXT,
    capacity INTEGER NOT NULL DEFAULT 224,
    sections INTEGER NOT NULL DEFAULT 2,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER,
    director TEXT,
    lead_actors TEXT,
    genre TEXT,
    subgenre TEXT,
    medium TEXT,
    visuals TEXT,
    sound TEXT,
    awards TEXT,
    tomatometer INTEGER,
    popcornmeter INTEGER,
    criterion_collection INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'owned',
    binder_id INTEGER REFERENCES binders(id),
    binder_category TEXT,
    binder_position INTEGER,
    poster_url TEXT,
    tmdb_id INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS watch_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movie_id INTEGER REFERENCES movies(id),
    title TEXT,
    watched_by TEXT,
    watched_at TEXT NOT NULL,
    rating REAL,
    notes TEXT,
    source TEXT DEFAULT 'manual',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    year INTEGER,
    requested_by TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT NOT NULL DEFAULT 'requested',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
  CREATE INDEX IF NOT EXISTS idx_movies_genre ON movies(genre);
  CREATE INDEX IF NOT EXISTS idx_movies_binder ON movies(binder_id);
  CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
  CREATE INDEX IF NOT EXISTS idx_watch_log_movie ON watch_log(movie_id);
  CREATE INDEX IF NOT EXISTS idx_watch_log_date ON watch_log(watched_at);
`);

console.log("Database migrated successfully at", DB_PATH);
sqlite.close();

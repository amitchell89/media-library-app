import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const movies = sqliteTable("movies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  year: integer("year"),
  director: text("director"),
  leadActors: text("lead_actors"),
  genre: text("genre"),
  subgenre: text("subgenre"),
  medium: text("medium"),
  visuals: text("visuals"),
  sound: text("sound"),
  awards: text("awards"),
  tomatometer: integer("tomatometer"),
  popcornmeter: integer("popcornmeter"),
  criterionCollection: integer("criterion_collection", { mode: "boolean" }).default(false),
  status: text("status").notNull().default("owned"),
  binderId: integer("binder_id").references(() => binders.id),
  binderCategory: text("binder_category"),
  binderPosition: integer("binder_position"),
  posterUrl: text("poster_url"),
  tmdbId: integer("tmdb_id"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const binders = sqliteTable("binders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  label: text("label"),
  capacity: integer("capacity").notNull().default(224),
  sections: integer("sections").notNull().default(2),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const watchLog = sqliteTable("watch_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  movieId: integer("movie_id").references(() => movies.id),
  tmdbId: integer("tmdb_id"),
  title: text("title"),
  watchedBy: text("watched_by"),
  watchedAt: text("watched_at").notNull(),
  rating: real("rating"),
  notes: text("notes"),
  source: text("source").default("manual"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const requests = sqliteTable("requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  year: integer("year"),
  requestedBy: text("requested_by"),
  priority: text("priority").default("medium"),
  status: text("status").notNull().default("requested"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;
export type Binder = typeof binders.$inferSelect;
export type WatchLogEntry = typeof watchLog.$inferSelect;
export type Request = typeof requests.$inferSelect;

import { db, schema } from "@/db";
import { sql, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const totalMovies = await db
    .select({ count: count() })
    .from(schema.movies);

  const byGenre = await db
    .select({
      genre: schema.movies.genre,
      count: count(),
    })
    .from(schema.movies)
    .groupBy(schema.movies.genre)
    .orderBy(sql`count(*) DESC`);

  const byMedium = await db
    .select({
      medium: schema.movies.medium,
      count: count(),
    })
    .from(schema.movies)
    .groupBy(schema.movies.medium)
    .orderBy(sql`count(*) DESC`);

  const byBinder = await db
    .select({
      binderId: schema.movies.binderId,
      count: count(),
    })
    .from(schema.movies)
    .groupBy(schema.movies.binderId)
    .orderBy(sql`count(*) DESC`);

  const binders = await db.select().from(schema.binders);

  const byStatus = await db
    .select({
      status: schema.movies.status,
      count: count(),
    })
    .from(schema.movies)
    .groupBy(schema.movies.status)
    .orderBy(schema.movies.status);

  const byDecade = await db
    .select({
      decade: sql<string>`(year / 10) * 10`,
      count: count(),
    })
    .from(schema.movies)
    .where(sql`year IS NOT NULL`)
    .groupBy(sql`(year / 10) * 10`)
    .orderBy(sql`(year / 10) * 10`);

  return NextResponse.json({
    total: totalMovies[0].count,
    byGenre: byGenre.filter((g) => g.genre),
    byMedium: byMedium.filter((m) => m.medium),
    byBinder: byBinder.map((b) => ({
      ...b,
      binderName: binders.find((bi) => bi.id === b.binderId)?.name || "Unassigned",
    })),
    byStatus,
    byDecade,
    binders,
  });
}

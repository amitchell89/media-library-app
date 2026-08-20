import { getDb, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const entries = await db
    .select({
      id: schema.watchLog.id,
      movieId: schema.watchLog.movieId,
      tmdbId: schema.watchLog.tmdbId,
      title: schema.watchLog.title,
      watchedBy: schema.watchLog.watchedBy,
      watchedAt: schema.watchLog.watchedAt,
      rating: schema.watchLog.rating,
      notes: schema.watchLog.notes,
      source: schema.watchLog.source,
      createdAt: schema.watchLog.createdAt,
      posterUrl: schema.movies.posterUrl,
    })
    .from(schema.watchLog)
    .leftJoin(schema.movies, eq(schema.watchLog.movieId, schema.movies.id))
    .orderBy(desc(schema.watchLog.watchedAt));

  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const body = (await request.json()) as Record<string, unknown>;

  if (body.tmdbId && !body.movieId) {
    const existing = await db
      .select({ id: schema.movies.id })
      .from(schema.movies)
      .where(eq(schema.movies.tmdbId, body.tmdbId as number))
      .limit(1);
    if (existing.length > 0) {
      body.movieId = existing[0].id;
    }
  }

  const result = await db.insert(schema.watchLog).values(body as any).returning();
  return NextResponse.json(result[0], { status: 201 });
}

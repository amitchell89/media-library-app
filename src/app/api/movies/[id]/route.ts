import { getDb, schema } from "@/db";
import { eq, or, desc } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const { id } = await params;
  const movieId = parseInt(id);

  const movie = await db
    .select()
    .from(schema.movies)
    .where(eq(schema.movies.id, movieId))
    .limit(1);

  if (!movie.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let binder = null;
  if (movie[0].binderId) {
    const binderResult = await db
      .select()
      .from(schema.binders)
      .where(eq(schema.binders.id, movie[0].binderId))
      .limit(1);
    binder = binderResult[0] || null;
  }

  const watchConditions = [eq(schema.watchLog.movieId, movieId)];
  if (movie[0].tmdbId) {
    watchConditions.push(eq(schema.watchLog.tmdbId, movie[0].tmdbId));
  }

  const watches = await db
    .select()
    .from(schema.watchLog)
    .where(or(...watchConditions))
    .orderBy(desc(schema.watchLog.watchedAt));

  return NextResponse.json({ ...movie[0], binder, watches });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const { id } = await params;

  const body = (await request.json()) as Record<string, unknown>;
  const result = await db
    .update(schema.movies)
    .set({ ...(body as any), updatedAt: new Date().toISOString() })
    .where(eq(schema.movies.id, parseInt(id)))
    .returning();

  return NextResponse.json(result[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);
  const { id } = await params;

  await db
    .delete(schema.movies)
    .where(eq(schema.movies.id, parseInt(id)));

  return NextResponse.json({ success: true });
}

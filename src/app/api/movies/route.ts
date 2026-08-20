import { getDb, schema } from "@/db";
import { like, eq, or, and, sql, desc, asc } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const params = request.nextUrl.searchParams;
  const search = params.get("search");
  const genre = params.get("genre");
  const medium = params.get("medium");
  const binder = params.get("binder");
  const status = params.get("status");
  const priority = params.get("priority");
  const sort = params.get("sort") || "title";
  const order = params.get("order") || "asc";

  let query = db.select().from(schema.movies).$dynamic();

  const conditions = [];

  if (search) {
    const searchTerm = `%${search}%`;
    conditions.push(
      or(
        like(schema.movies.title, searchTerm),
        like(schema.movies.director, searchTerm),
        like(schema.movies.leadActors, searchTerm),
        like(schema.movies.binderCategory, searchTerm)
      )
    );
  }

  if (genre) {
    conditions.push(eq(schema.movies.genre, genre));
  }

  if (medium) {
    conditions.push(eq(schema.movies.medium, medium));
  }

  if (binder) {
    conditions.push(eq(schema.movies.binderId, parseInt(binder)));
  }

  if (status) {
    conditions.push(eq(schema.movies.status, status));
  }

  if (priority) {
    conditions.push(eq(schema.movies.wishlistPriority, priority));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const sortColumn =
    sort === "year"
      ? schema.movies.year
      : sort === "genre"
        ? schema.movies.genre
        : sort === "tomatometer"
          ? schema.movies.tomatometer
          : schema.movies.title;

  query = query.orderBy(
    order === "desc" ? desc(sortColumn) : asc(sortColumn)
  );

  const movies = await query;
  return NextResponse.json(movies);
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const body = (await request.json()) as Record<string, unknown>;
  const result = await db.insert(schema.movies).values(body as any).returning();
  return NextResponse.json(result[0], { status: 201 });
}

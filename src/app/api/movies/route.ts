import { db, schema } from "@/db";
import { like, eq, or, inArray, sql, desc, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("search");
  const genre = params.get("genre");
  const medium = params.get("medium");
  const binder = params.get("binder");
  const status = params.get("status");
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
    if (status === "owned") {
      conditions.push(
        inArray(schema.movies.status, ["1 - Owned", "1 - Shipped"])
      );
    } else if (status === "wishlist") {
      conditions.push(
        inArray(schema.movies.status, [
          "2 - Buy Next",
          "2 - High",
          "3 - Medium",
          "4 - Low",
        ])
      );
    } else {
      conditions.push(eq(schema.movies.status, status));
    }
  }

  if (conditions.length > 0) {
    for (const condition of conditions) {
      if (condition) query = query.where(condition);
    }
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
  const body = await request.json();
  const result = await db.insert(schema.movies).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}

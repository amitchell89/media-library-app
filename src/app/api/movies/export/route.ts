import { db, schema } from "@/db";
import { eq, asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") || "json";

  const allMovies = await db.select().from(schema.movies).orderBy(asc(schema.movies.title));
  const allBinders = await db.select().from(schema.binders);
  const binderMap = new Map(allBinders.map((b) => [b.id, b]));

  const movies = allMovies.map((movie) => {
    const binder = movie.binderId ? binderMap.get(movie.binderId) : null;
    return {
      title: movie.title,
      status: movie.status,
      medium: movie.medium || "",
      visuals: movie.visuals || "",
      sound: movie.sound || "",
      genre: movie.genre || "",
      subgenre: movie.subgenre || "",
      year: movie.year ?? "",
      director: movie.director || "",
      leadActors: movie.leadActors || "",
      awards: movie.awards || "",
      tomatometer: movie.tomatometer ?? "",
      popcornmeter: movie.popcornmeter ?? "",
      binderCategory: movie.binderCategory || "",
      binder: binder?.label || "",
      criterionCollection: movie.criterionCollection ? "Yes" : "",
    };
  });

  if (format === "csv") {
    const headers = [
      "Title", "Status", "Medium", "Visuals", "Sound", "Genre",
      "Sub Genre", "Year", "Director", "Lead Actors", "Awards",
      "Tomatometer", "Popcornmeter", "Binder Category", "Binder",
      "Criterion Collection",
    ];
    const csvRows = [headers.join(",")];
    for (const m of movies) {
      const row = [
        m.title, m.status, m.medium, m.visuals, m.sound, m.genre,
        m.subgenre, String(m.year), m.director, m.leadActors, m.awards,
        String(m.tomatometer), String(m.popcornmeter), m.binderCategory,
        m.binder, m.criterionCollection,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(row.join(","));
    }

    return new NextResponse(csvRows.join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="reel-shelf-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  return NextResponse.json(movies);
}

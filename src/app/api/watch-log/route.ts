import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const entries = await db
    .select()
    .from(schema.watchLog)
    .orderBy(desc(schema.watchLog.watchedAt));
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await db.insert(schema.watchLog).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}

import { db, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const entries = await db
    .select()
    .from(schema.requests)
    .orderBy(desc(schema.requests.createdAt));
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await db.insert(schema.requests).values(body).returning();
  return NextResponse.json(result[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  const result = await db
    .update(schema.requests)
    .set(updates)
    .where(eq(schema.requests.id, id))
    .returning();
  return NextResponse.json(result[0]);
}

import { getDb, schema } from "@/db";
import { desc, eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const entries = await db
    .select()
    .from(schema.requests)
    .orderBy(desc(schema.requests.createdAt));
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const body = (await request.json()) as Record<string, unknown>;
  const result = await db.insert(schema.requests).values(body as any).returning();
  return NextResponse.json(result[0], { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const body = (await request.json()) as Record<string, unknown>;
  const { id, ...updates } = body as { id: number; [key: string]: unknown };
  const result = await db
    .update(schema.requests)
    .set(updates)
    .where(eq(schema.requests.id, id))
    .returning();
  return NextResponse.json(result[0]);
}

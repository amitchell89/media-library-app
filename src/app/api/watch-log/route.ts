import { getDb, schema } from "@/db";
import { desc } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const entries = await db
    .select()
    .from(schema.watchLog)
    .orderBy(desc(schema.watchLog.watchedAt));
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const body = (await request.json()) as Record<string, unknown>;
  const result = await db.insert(schema.watchLog).values(body as any).returning();
  return NextResponse.json(result[0], { status: 201 });
}

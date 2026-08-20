import { getDb, schema } from "@/db";
import { eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const { env } = await getCloudflareContext({ async: true });
  const db = getDb(env.DB);

  const body = (await request.json()) as Array<{ id: number; rank: number }>;

  for (const item of body) {
    await db
      .update(schema.movies)
      .set({ wishlistRank: item.rank })
      .where(eq(schema.movies.id, item.id));
  }

  return NextResponse.json({ ok: true });
}

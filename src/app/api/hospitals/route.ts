import { db } from "@/db";
import { hospitals } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { mockStore } from "@/lib/mock-store";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  try {
    const rows = await db.select().from(hospitals);
    if (rows.length) return Response.json(rows);
  } catch {}
  return Response.json(mockStore.hospitals);
}

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  return Response.json(await db.select().from(notifications).orderBy(desc(notifications.id)).limit(100));
}

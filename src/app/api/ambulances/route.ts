import { db } from "@/db";
import { ambulances } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { mockStore } from "@/lib/mock-store";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureSeeded();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  try {
    const rows = await db
      .select()
      .from(ambulances)
      .where(status ? eq(ambulances.status, status) : undefined);
    if (rows.length) return Response.json(rows);
  } catch {}

  const result = status
    ? mockStore.ambulances.filter((a) => a.status === status)
    : mockStore.ambulances;
  return Response.json(result);
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  const status = body.status;
  if (!id) return Response.json({ error: "id required" }, { status: 400 });

  const amb = mockStore.ambulances.find((a) => a.id === id);
  if (amb && status) amb.status = status;

  try {
    const [updated] = await db
      .update(ambulances)
      .set({
        ...(status ? { status } : {}),
        ...(body.lat ? { lat: Number(body.lat) } : {}),
        ...(body.lng ? { lng: Number(body.lng) } : {}),
      })
      .where(eq(ambulances.id, id))
      .returning();
    if (updated) return Response.json(updated);
  } catch {}

  return Response.json(amb ?? { id, status });
}

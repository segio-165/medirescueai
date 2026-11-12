import { db } from "@/db";
import { doctors } from "@/db/schema";
import { ensureSeeded } from "@/lib/seed";
import { mockStore } from "@/lib/mock-store";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureSeeded();
  const url = new URL(req.url);
  const speciality = url.searchParams.get("speciality");
  try {
    const rows = await db
      .select()
      .from(doctors)
      .where(speciality ? eq(doctors.speciality, speciality) : undefined);
    if (rows.length) return Response.json(rows);
  } catch {}

  const result = speciality
    ? mockStore.doctors.filter((d) => d.speciality === speciality)
    : mockStore.doctors;
  return Response.json(result);
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  const availability = body.availability;
  if (!id || !availability) return Response.json({ error: "id and availability required" }, { status: 400 });

  const doc = mockStore.doctors.find((d) => d.id === id);
  if (doc) doc.availability = availability;

  try {
    const [updated] = await db
      .update(doctors)
      .set({ availability })
      .where(eq(doctors.id, id))
      .returning();
    if (updated) return Response.json(updated);
  } catch {}

  return Response.json(doc ?? { id, availability });
}

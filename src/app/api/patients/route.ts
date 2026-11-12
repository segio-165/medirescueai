import { db } from "@/db";
import { patients } from "@/db/schema";
import { DEMO_PATIENT_ID, ensureSeeded } from "@/lib/seed";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DEMO_PATIENT = {
  id: DEMO_PATIENT_ID,
  name: "Victor Kimani",
  phone: "+254 700 123 456",
  bloodGroup: "O+",
  allergies: "Penicillin",
  lat: -0.3031,
  lng: 36.08,
};

export async function GET(req: Request) {
  await ensureSeeded();
  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id") ?? DEMO_PATIENT_ID);
  try {
    const [p] = await db.select().from(patients).where(eq(patients.id, id));
    if (p) return Response.json(p);
  } catch {}
  return Response.json(DEMO_PATIENT);
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = Number(body.id ?? DEMO_PATIENT_ID);
  try {
    const [updated] = await db.update(patients).set(body).where(eq(patients.id, id)).returning();
    if (updated) return Response.json(updated);
  } catch {}
  return Response.json({ ...DEMO_PATIENT, ...body });
}

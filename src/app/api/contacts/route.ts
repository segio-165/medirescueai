import { db } from "@/db";
import { emergencyContacts } from "@/db/schema";
import { DEMO_PATIENT_ID, ensureSeeded } from "@/lib/seed";
import { mockStore } from "@/lib/mock-store";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureSeeded();
  const url = new URL(req.url);
  const patientId = Number(url.searchParams.get("patientId") ?? DEMO_PATIENT_ID);
  try {
    const rows = await db
      .select()
      .from(emergencyContacts)
      .where(eq(emergencyContacts.patientId, patientId));
    if (rows.length) return Response.json(rows);
  } catch {}

  return Response.json(mockStore.contacts);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const patientId = Number(body.patientId ?? DEMO_PATIENT_ID);
  const { name, relation, phone, email, channels } = body;
  if (!name || !relation || !phone) {
    return Response.json({ error: "name, relation, phone required" }, { status: 400 });
  }

  const newContact = {
    id: Date.now(),
    patientId,
    name,
    relation,
    phone,
    email: email ?? null,
    channels: channels ?? "sms,whatsapp",
  };
  mockStore.contacts.push(newContact);

  try {
    const [inserted] = await db
      .insert(emergencyContacts)
      .values({
        patientId,
        name,
        relation,
        phone,
        email,
        channels: channels ?? "sms,whatsapp",
      })
      .returning();
    if (inserted) return Response.json(inserted, { status: 201 });
  } catch {}

  return Response.json(newContact, { status: 201 });
}

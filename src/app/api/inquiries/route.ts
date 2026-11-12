import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { DEMO_PATIENT_ID, ensureSeeded } from "@/lib/seed";
import { mockStore } from "@/lib/mock-store";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureSeeded();
  try {
    const rows = await db.select().from(inquiries).orderBy(inquiries.createdAt);
    if (rows.length) return Response.json(rows);
  } catch {}
  return Response.json(mockStore.inquiries);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, phone, subject, message } = body;
  if (!name || !subject || !message) {
    return Response.json({ error: "name, subject, message required" }, { status: 400 });
  }

  const newInquiry = {
    id: Date.now(),
    patientId: Number(body.patientId ?? DEMO_PATIENT_ID),
    name,
    phone: phone ?? null,
    subject,
    message,
    reply: null,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  mockStore.inquiries.push(newInquiry);

  try {
    const [inserted] = await db
      .insert(inquiries)
      .values({
        patientId: Number(body.patientId ?? DEMO_PATIENT_ID),
        name,
        phone,
        subject,
        message,
      })
      .returning();
    if (inserted) return Response.json(inserted, { status: 201 });
  } catch {}

  return Response.json(newInquiry, { status: 201 });
}

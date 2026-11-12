import { db } from "@/db";
import { bookings } from "@/db/schema";
import { DEMO_PATIENT_ID, ensureSeeded } from "@/lib/seed";
import { mockStore } from "@/lib/mock-store";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureSeeded();
  const url = new URL(req.url);
  const patientId = url.searchParams.get("patientId") ? Number(url.searchParams.get("patientId")) : undefined;
  const doctorId = url.searchParams.get("doctorId") ? Number(url.searchParams.get("doctorId")) : undefined;

  try {
    const rows = await db
      .select()
      .from(bookings)
      .where(
        patientId ? eq(bookings.patientId, patientId) : doctorId ? eq(bookings.doctorId, doctorId) : undefined
      );
    if (rows.length) return Response.json(rows);
  } catch {}

  return Response.json(mockStore.bookings);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const patientId = Number(body.patientId ?? DEMO_PATIENT_ID);
  const doctorId = Number(body.doctorId);
  const { date, time, reason, type } = body;
  if (!doctorId || !date || !time) {
    return Response.json({ error: "doctorId, date, time required" }, { status: 400 });
  }

  const newBooking = {
    id: Date.now(),
    patientId,
    doctorId,
    date,
    time,
    reason: reason ?? "",
    type: type ?? "video",
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  mockStore.bookings.push(newBooking);

  try {
    const [inserted] = await db
      .insert(bookings)
      .values({
        patientId,
        doctorId,
        date,
        time,
        reason,
        type: type ?? "video",
      })
      .returning();
    if (inserted) return Response.json(inserted, { status: 201 });
  } catch {}

  return Response.json(newBooking, { status: 201 });
}

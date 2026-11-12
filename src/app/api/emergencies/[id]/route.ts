import { db } from "@/db";
import { ambulances, doctors, emergencies, notifications } from "@/db/schema";
import { getEmergencyDetail } from "@/lib/emergency";
import { mockStore } from "@/lib/mock-store";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const detail = await getEmergencyDetail(Number(id));
  if (!detail) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(detail);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const eid = Number(id);
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");

  let e = mockStore.emergencies.find((item) => item.id === eid);
  try {
    const [dbE] = await db.select().from(emergencies).where(eq(emergencies.id, eid));
    if (dbE) e = dbE as any;
  } catch {}

  if (!e && mockStore.emergencies.length > 0) {
    e = mockStore.emergencies[0];
  }

  if (!e) return Response.json({ error: "not found" }, { status: 404 });

  switch (action) {
    case "doctor_accept":
      e.doctorStatus = "accepted";
      if (e.status === "open") e.status = "doctor_assigned";
      break;
    case "doctor_reject":
      e.doctorStatus = "rejected";
      break;
    case "ambulance_accept":
      e.ambulanceStatus = "accepted";
      e.status = "en_route";
      break;
    case "ambulance_arrived":
      e.ambulanceStatus = "arrived";
      e.status = "arrived";
      break;
    case "resolve":
      e.status = "resolved";
      break;
    case "cancel":
      e.status = "cancelled";
      break;
  }

  try {
    const patch: any = { status: e.status, doctorStatus: e.doctorStatus, ambulanceStatus: e.ambulanceStatus };
    await db.update(emergencies).set(patch).where(eq(emergencies.id, eid));
  } catch {}

  const detail = await getEmergencyDetail(eid);
  return Response.json(detail);
}

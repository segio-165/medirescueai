import { createEmergency, listEmergencies } from "@/lib/emergency";
import { DEFAULT_LOCATION } from "@/lib/geo";
import { DEMO_PATIENT_ID } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams;
  const data = await listEmergencies({
    doctorId: q.get("doctorId") ? Number(q.get("doctorId")) : undefined,
    ambulanceId: q.get("ambulanceId") ? Number(q.get("ambulanceId")) : undefined,
    patientId: q.get("patientId") ? Number(q.get("patientId")) : undefined,
    active: q.get("active") === "1",
  });
  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const isSos = Boolean(body.isSos);
  const symptoms = String(body.symptoms ?? (isSos ? "SOS button pressed – patient unable to describe symptoms" : "")).trim();
  if (!symptoms) return Response.json({ error: "symptoms required" }, { status: 400 });

  const result = await createEmergency({
    patientId: Number(body.patientId ?? DEMO_PATIENT_ID),
    symptoms,
    lat: Number(body.lat ?? DEFAULT_LOCATION.lat),
    lng: Number(body.lng ?? DEFAULT_LOCATION.lng),
    isSos,
    assessment: isSos && !body.symptoms
      ? {
          severity: "RED",
          risk: "SOS – Unknown Critical Emergency",
          priorityLabel: "RED",
          summary: "SOS triggered. Treating as critical until proven otherwise.",
          firstAid: [
            "Stay where you are if safe. Help is on the way.",
            "Keep your phone on and unlocked.",
            "If possible, unlock the door or send someone to guide the ambulance.",
            "If you are with the patient, keep them calm and monitor breathing.",
          ],
          actions: ["Call Ambulance Immediately", "Connect Doctor Now", "Notify Family"],
          callAmbulance: true,
          connectDoctor: true,
          recommendedSpeciality: "Emergency Physician",
          source: "rules",
        }
      : undefined,
  });
  return Response.json(result, { status: 201 });
}

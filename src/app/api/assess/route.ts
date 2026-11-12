import { assessSymptoms, DISCLAIMER } from "@/lib/triage";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const symptoms = String(body.symptoms ?? "").trim();
  if (!symptoms) return Response.json({ error: "symptoms required" }, { status: 400 });
  const assessment = await assessSymptoms(symptoms);
  return Response.json({ ...assessment, disclaimer: DISCLAIMER });
}

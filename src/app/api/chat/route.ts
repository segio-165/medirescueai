import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { chatReply, DISCLAIMER } from "@/lib/triage";
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
      .from(chatMessages)
      .where(eq(chatMessages.patientId, patientId))
      .orderBy(chatMessages.id);
    return Response.json(rows);
  } catch {
    return Response.json(mockStore.chat.filter((m) => m.patientId === patientId));
  }
}

export async function POST(req: Request) {
  await ensureSeeded();
  const body = await req.json().catch(() => ({}));
  const patientId = Number(body.patientId ?? DEMO_PATIENT_ID);
  const content = String(body.message ?? "").trim();
  if (!content) return Response.json({ error: "message required" }, { status: 400 });

  let history: { role: "user" | "assistant"; content: string }[] = [];
  try {
    const rows = await db.select().from(chatMessages).where(eq(chatMessages.patientId, patientId)).orderBy(chatMessages.id);
    history = rows.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  } catch {
    history = mockStore.chat.filter((m) => m.patientId === patientId).map((m) => ({ role: m.role, content: m.content }));
  }

  const { reply, assessment } = await chatReply(history, content);

  const fallbackUser = { id: Date.now(), patientId, role: "user" as const, content, createdAt: new Date().toISOString() };
  const fallbackAssistant = { id: Date.now() + 1, patientId, role: "assistant" as const, content: reply, createdAt: new Date().toISOString() };

  mockStore.chat.push(fallbackUser);
  mockStore.chat.push(fallbackAssistant);

  try {
    await db.insert(chatMessages).values({ patientId, role: "user", content });
    const [saved] = await db
      .insert(chatMessages)
      .values({ patientId, role: "assistant", content: reply })
      .returning();
    if (saved) {
      return Response.json({ reply: saved, assessment, disclaimer: DISCLAIMER });
    }
  } catch {
    // DB offline, return in-memory saved
  }

  return Response.json({ reply: fallbackAssistant, assessment, disclaimer: DISCLAIMER });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const patientId = Number(url.searchParams.get("patientId") ?? DEMO_PATIENT_ID);
  mockStore.chat = mockStore.chat.filter((m) => m.patientId !== patientId);
  try {
    await db.delete(chatMessages).where(eq(chatMessages.patientId, patientId));
  } catch {}
  return Response.json({ ok: true });
}

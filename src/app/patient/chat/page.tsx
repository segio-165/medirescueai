"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SeverityBadge from "@/components/SeverityBadge";
import { api } from "@/lib/client";
import type { Assessment } from "@/lib/triage";

interface Msg {
  id: number;
  role: string;
  content: string;
}

const QUICK = [
  "I have chest pain and my left arm feels numb",
  "My child is wheezing and the inhaler is not helping",
  "I've had a mild headache since morning",
  "Someone collapsed and is not breathing",
];

function renderMd(text: string) {
  // tiny markdown: **bold**, _italic_, line breaks
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith("_") && p.endsWith("_")) return <em key={i} className="text-amber-300/90">{p.slice(1, -1)}</em>;
    return <span key={i}>{p}</span>;
  });
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<Assessment | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<Msg[]>("/api/chat").then(setMessages);
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { id: Date.now(), role: "user", content }]);
    try {
      const res = await api<{ reply: Msg; assessment: Assessment }>("/api/chat", { method: "POST", json: { message: content } });
      setMessages((m) => [...m, res.reply]);
      setLast(res.assessment);
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    await api("/api/chat", { method: "DELETE" });
    setMessages([]);
    setLast(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card flex h-[640px] flex-col lg:col-span-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-bold">🤖 MediRescue AI Doctor</h3>
            <p className="text-xs text-slate-400">Conversational triage · first-aid coaching · escalates to SOS</p>
          </div>
          <button onClick={clear} className="btn-secondary px-3 py-1.5 text-xs">
            New chat
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {messages.length === 0 && (
            <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
              Hello, I&apos;m MediRescue AI. Tell me what&apos;s happening and I&apos;ll assess the severity, guide you through
              first aid, and dispatch help if needed. <br />
              <span className="text-xs text-amber-300/90">I do not replace professional medical care.</span>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-red-600 text-white" : "bg-white/10 text-slate-100"
                }`}
              >
                {renderMd(m.content)}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-slate-400">AI is thinking…</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="flex flex-wrap gap-1.5 pb-2">
          {QUICK.map((q) => (
            <button key={q} onClick={() => send(q)} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10">
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input className="input" placeholder="Describe your symptoms…" value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="btn-primary" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="card">
          <p className="text-xs uppercase tracking-wide text-slate-400">Live triage from this conversation</p>
          {last ? (
            <>
              <div className="mt-2">
                <SeverityBadge severity={last.severity} big />
              </div>
              <p className="mt-3 font-semibold">{last.risk}</p>
              <p className="text-sm text-slate-400">Suggested: {last.recommendedSpeciality}</p>
              <div className="mt-4 space-y-2">
                {last.callAmbulance ? (
                  <Link href="/patient" className="btn-primary w-full">
                    🚨 Request Ambulance Now
                  </Link>
                ) : (
                  <Link href="/patient/book" className="btn-secondary w-full">
                    📅 Book a Consultation
                  </Link>
                )}
                <Link href="/patient/nearby" className="btn-secondary w-full">
                  📍 Nearest Doctor / Hospital
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Send a message to see the AI&apos;s severity classification.</p>
          )}
        </div>
        <div className="card text-xs text-slate-400">
          <p className="font-bold text-slate-200">How it works</p>
          <p className="mt-1">
            A medical rule engine classifies every message (GREEN → RED). When an <code>OPENAI_API_KEY</code> is set, GPT
            handles the conversation and the rule engine acts as a safety floor that can only escalate, never downgrade.
          </p>
        </div>
      </div>
    </div>
  );
}

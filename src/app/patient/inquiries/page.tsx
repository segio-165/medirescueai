"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "@/components/SeverityBadge";
import { api, timeAgo } from "@/lib/client";

interface Inquiry {
  id: number;
  name: string;
  subject: string;
  message: string;
  reply: string | null;
  status: string;
  createdAt: string;
}

export default function InquiriesPage() {
  const [list, setList] = useState<Inquiry[]>([]);
  const [form, setForm] = useState({ name: "Victor Kimani", phone: "+254 700 123 456", subject: "", message: "" });
  const [ok, setOk] = useState(false);

  const load = () => api<Inquiry[]>("/api/inquiries").then(setList);
  useEffect(() => {
    load();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api("/api/inquiries", { method: "POST", json: form });
    setForm({ ...form, subject: "", message: "" });
    setOk(true);
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="card space-y-3">
        <h3 className="font-bold">💬 Send an inquiry</h3>
        <p className="text-xs text-slate-400">Non-urgent questions about services, billing, insurance, or follow-ups.</p>
        <input className="input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        <textarea className="input min-h-[100px]" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        <button className="btn-primary w-full">Submit</button>
        {ok && <p className="text-sm text-emerald-400">✅ Inquiry received. The hospital admin will respond shortly.</p>}
      </form>
      <div className="card">
        <h3 className="font-bold">Recent inquiries</h3>
        <div className="mt-3 space-y-2">
          {list.length === 0 && <p className="text-sm text-slate-400">No inquiries yet.</p>}
          {list.map((q) => (
            <div key={q.id} className="rounded-xl bg-black/30 p-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{q.subject}</p>
                <StatusPill status={q.status} />
              </div>
              <p className="text-sm text-slate-300">{q.message}</p>
              {q.reply && <p className="mt-2 rounded-lg bg-emerald-500/10 p-2 text-sm text-emerald-200">↩ {q.reply}</p>}
              <p className="mt-1 text-xs text-slate-500">
                {q.name} · {timeAgo(q.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

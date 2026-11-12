"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";

interface Contact {
  id: number;
  name: string;
  relation: string;
  phone: string;
  email: string | null;
  channels: string;
}

const CHANNELS = ["sms", "whatsapp", "email"];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({ name: "", relation: "Mother", phone: "", email: "", channels: ["sms", "whatsapp"] });

  const load = () => api<Contact[]>("/api/contacts").then(setContacts);
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await api("/api/contacts", { method: "POST", json: form });
    setForm({ name: "", relation: "Mother", phone: "", email: "", channels: ["sms", "whatsapp"] });
    load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <h3 className="font-bold">👨‍👩‍👧 Emergency contacts</h3>
        <p className="text-xs text-slate-400">These people are notified automatically when you press SOS.</p>
        <div className="mt-4 space-y-2">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-black/30 p-3">
              <div>
                <p className="font-semibold">
                  {c.name} <span className="text-xs text-slate-400">· {c.relation}</span>
                </p>
                <p className="text-xs text-slate-400">
                  {c.phone} {c.email ? `· ${c.email}` : ""}
                </p>
                <div className="mt-1 flex gap-1">
                  {c.channels.split(",").map((ch) => (
                    <span key={ch} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={async () => {
                  await api(`/api/contacts?id=${c.id}`, { method: "DELETE" });
                  load();
                }}
                className="text-xs text-red-400 underline"
              >
                remove
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          <p className="font-bold">Sample alert message</p>
          <p className="mt-1">
            Victor has requested emergency assistance. Current location: https://maps.google.com/?q=-0.3031,36.08
          </p>
        </div>
      </div>

      <form onSubmit={add} className="card space-y-3">
        <h3 className="font-bold">Add contact</h3>
        <div>
          <label className="label">Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Relation</label>
            <select className="input" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })}>
              {["Mother", "Father", "Brother", "Sister", "Spouse", "Friend", "Other"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 7…" required />
          </div>
        </div>
        <div>
          <label className="label">Email (optional)</label>
          <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="label">Channels</label>
          <div className="flex gap-2">
            {CHANNELS.map((ch) => {
              const on = form.channels.includes(ch);
              return (
                <button
                  type="button"
                  key={ch}
                  onClick={() => setForm({ ...form, channels: on ? form.channels.filter((c) => c !== ch) : [...form.channels, ch] })}
                  className={`rounded-full px-3 py-1 text-xs uppercase ${on ? "bg-emerald-600 text-white" : "bg-white/10 text-slate-300"}`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>
        <button className="btn-primary w-full">Save contact</button>
      </form>
    </div>
  );
}

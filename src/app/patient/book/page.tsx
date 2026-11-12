"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { StatusPill } from "@/components/SeverityBadge";
import { api } from "@/lib/client";

interface Doc {
  id: number;
  name: string;
  speciality: string;
  availability: string;
  hospitalName: string | null;
}
interface Booking {
  id: number;
  date: string;
  time: string;
  reason: string | null;
  type: string;
  status: string;
  doctorName: string | null;
  speciality: string | null;
}

const CATEGORIES = ["General Physician", "Pediatrician", "Cardiologist", "Dermatologist"];

function BookInner() {
  const sp = useSearchParams();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [category, setCategory] = useState("");
  const [doctorId, setDoctorId] = useState(sp.get("doctorId") ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:30");
  const [type, setType] = useState("video");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => api<Booking[]>("/api/bookings").then(setBookings);
  useEffect(() => {
    api<Doc[]>("/api/doctors").then(setDocs);
    load();
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (doctorId && docs.length) {
      const d = docs.find((x) => String(x.id) === doctorId);
      if (d && !category) setCategory(CATEGORIES.includes(d.speciality) ? d.speciality : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs]);

  const filtered = docs.filter((d) => !category || d.speciality === category);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await api("/api/bookings", { method: "POST", json: { doctorId: Number(doctorId), date, time, type, reason } });
      const d = docs.find((x) => String(x.id) === doctorId);
      setMsg(`✅ Booked ${d?.name} on ${date} at ${time}.`);
      setReason("");
      load();
    } catch (err) {
      setMsg(`❌ ${(err as Error).message}`);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={submit} className="card space-y-4">
        <h3 className="font-bold">📅 Book a consultation</h3>
        <div>
          <label className="label">Category</label>
          <div className="flex flex-wrap gap-2">
            {["", ...CATEGORIES].map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => {
                  setCategory(c);
                  setDoctorId("");
                }}
                className={`rounded-full px-3 py-1 text-xs ${category === c ? "bg-red-600 text-white" : "bg-white/10 text-slate-300"}`}
              >
                {c || "All"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Doctor</label>
          <select className="input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
            <option value="">Select doctor…</option>
            {filtered.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.speciality} {d.hospitalName ? `(${d.hospitalName})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label">Time</label>
            <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label">Type</label>
          <div className="flex gap-2">
            {[
              ["video", "📹 Video consultation"],
              ["in_person", "🏥 In person"],
            ].map(([v, l]) => (
              <button type="button" key={v} onClick={() => setType(v)} className={`flex-1 rounded-xl px-3 py-2 text-sm ${type === v ? "bg-red-600 text-white" : "bg-white/10"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Reason (optional)</label>
          <textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Follow-up on chest pain…" />
        </div>
        <button className="btn-primary w-full">Confirm booking</button>
        {msg && <p className="text-sm">{msg}</p>}
      </form>

      <div className="card">
        <h3 className="font-bold">My appointments</h3>
        <div className="mt-3 space-y-2">
          {bookings.length === 0 && <p className="text-sm text-slate-400">No appointments yet.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-xl bg-black/30 p-3">
              <div>
                <p className="font-semibold">{b.doctorName}</p>
                <p className="text-xs text-slate-400">
                  {b.speciality} · {b.date} at {b.time} · {b.type === "video" ? "Video" : "In person"}
                </p>
                {b.reason && <p className="text-xs text-slate-500">{b.reason}</p>}
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusPill status={b.status} />
                {b.status === "confirmed" && (
                  <button
                    onClick={async () => {
                      await api(`/api/bookings?id=${b.id}`, { method: "DELETE" });
                      load();
                    }}
                    className="text-xs text-slate-400 underline"
                  >
                    cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="card">Loading…</div>}>
      <BookInner />
    </Suspense>
  );
}

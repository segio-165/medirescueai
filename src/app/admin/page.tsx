"use client";

import { useState } from "react";
import Link from "next/link";
import LiveMap, { type MapMarker } from "@/components/LiveMap";
import SeverityBadge, { StatusPill } from "@/components/SeverityBadge";
import { api, timeAgo, usePoll } from "@/lib/client";
import type { EmergencyRow, Hospital, Notification } from "@/lib/types";

interface Doc {
  id: number;
  name: string;
  speciality: string;
  availability: string;
  hospitalId: number | null;
  hospitalName: string | null;
  lat: number;
  lng: number;
}
interface Amb {
  id: number;
  code: string;
  plateNumber: string;
  driverName: string;
  status: string;
  hospitalId: number | null;
  hospitalName: string | null;
  lat: number;
  lng: number;
}
interface Inquiry {
  id: number;
  name: string;
  subject: string;
  message: string;
  reply: string | null;
  status: string;
  createdAt: string;
}

type Tab = "monitor" | "doctors" | "fleet" | "hospitals" | "inquiries" | "log";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("monitor");
  const { data: cases, refresh: refreshCases } = usePoll<EmergencyRow[]>("/api/emergencies", 4000);
  const { data: docs, refresh: refreshDocs } = usePoll<Doc[]>("/api/doctors", 6000);
  const { data: ambs, refresh: refreshAmbs } = usePoll<Amb[]>("/api/ambulances", 6000);
  const { data: hosps, refresh: refreshHosps } = usePoll<Hospital[]>("/api/hospitals", 10000);
  const { data: inquiries, refresh: refreshInq } = usePoll<Inquiry[]>("/api/inquiries", 8000);
  const { data: log } = usePoll<Notification[]>("/api/notifications", 5000);

  const active = (cases ?? []).filter((c) => c.status !== "resolved" && c.status !== "cancelled");
  const stats = {
    active: active.length,
    red: active.filter((c) => c.severity === "RED").length,
    docsAvail: (docs ?? []).filter((d) => d.availability === "available").length,
    ambAvail: (ambs ?? []).filter((a) => a.status === "available").length,
    beds: (hosps ?? []).reduce((s, h) => s + h.bedsAvailable, 0),
    resolved: (cases ?? []).filter((c) => c.status === "resolved").length,
  };

  const markers: MapMarker[] = [];
  active.forEach((c) => {
    markers.push({ id: `p${c.id}`, lat: c.patientLat, lng: c.patientLng, label: `#${c.id} ${c.severity} – ${c.risk}`, kind: "patient", highlight: c.severity === "RED" });
    if (c.ambulanceLive && c.ambulance) markers.push({ id: `a${c.id}`, lat: c.ambulanceLive.lat, lng: c.ambulanceLive.lng, label: `Ambulance ${c.ambulance.code} → #${c.id}`, kind: "ambulance" });
  });
  (ambs ?? []).filter((a) => a.status === "available").forEach((a) => markers.push({ id: `amb${a.id}`, lat: a.lat, lng: a.lng, label: `Ambulance ${a.code} (available)`, kind: "ambulance" }));
  (hosps ?? []).forEach((h) => markers.push({ id: `h${h.id}`, lat: h.lat, lng: h.lng, label: h.name, kind: "hospital" }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Hospital Command Centre</h1>
        <p className="text-sm text-slate-400">Monitor emergencies · manage doctors &amp; fleet · hospital capacity · inquiries</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ["Active cases", stats.active, "text-white"],
          ["Critical (RED)", stats.red, "text-red-400"],
          ["Doctors available", stats.docsAvail, "text-blue-300"],
          ["Ambulances free", stats.ambAvail, "text-amber-300"],
          ["Emergency beds", stats.beds, "text-emerald-300"],
          ["Resolved", stats.resolved, "text-slate-300"],
        ].map(([l, v, c]) => (
          <div key={String(l)} className="card py-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">{l}</p>
            <p className={`text-2xl font-black ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-white/5 p-1 text-sm">
        {(
          [
            ["monitor", "🗺 Live monitor"],
            ["doctors", "🩺 Doctors"],
            ["fleet", "🚑 Fleet"],
            ["hospitals", "🏥 Capacity"],
            ["inquiries", "💬 Inquiries"],
            ["log", "📨 Notification log"],
          ] as [Tab, string][]
        ).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-lg px-3 py-2 ${tab === t ? "bg-red-600 text-white" : "text-slate-300 hover:bg-white/10"}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "monitor" && (
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="card p-0 overflow-hidden lg:col-span-3">
            <LiveMap className="h-[520px] rounded-none" center={{ lat: -0.295, lng: 36.072 }} zoom={13} markers={markers} />
          </div>
          <div className="space-y-2 lg:col-span-2 max-h-[520px] overflow-y-auto pr-1">
            {(cases ?? []).length === 0 && <div className="card text-sm text-slate-400">No emergency cases yet.</div>}
            {(cases ?? []).map((c) => (
              <div key={c.id} className="card py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href={`/patient/track/${c.id}`} className="font-bold underline-offset-2 hover:underline">
                      #{c.id}
                    </Link>
                    <SeverityBadge severity={c.severity} />
                    <StatusPill status={c.status} />
                  </div>
                  <span className="text-xs text-slate-400">{timeAgo(c.timestamp)}</span>
                </div>
                <p className="mt-1 text-sm">{c.risk}</p>
                <p className="text-xs text-slate-400">
                  {c.patient?.name} · Dr {c.doctor?.name ?? "—"} ({c.doctorStatus}) · Amb {c.ambulance?.code ?? "—"} ({c.ambulanceStatus}) → {c.hospital?.name ?? "—"}
                </p>
                {c.status !== "resolved" && c.status !== "cancelled" && (
                  <button
                    onClick={async () => {
                      await api(`/api/emergencies/${c.id}`, { method: "PATCH", json: { action: "resolve" } });
                      refreshCases();
                      refreshDocs();
                      refreshAmbs();
                    }}
                    className="mt-2 text-xs text-emerald-400 underline"
                  >
                    mark resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "doctors" && <DoctorsPanel docs={docs ?? []} hosps={hosps ?? []} refresh={refreshDocs} />}
      {tab === "fleet" && <FleetPanel ambs={ambs ?? []} hosps={hosps ?? []} refresh={refreshAmbs} />}
      {tab === "hospitals" && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(hosps ?? []).map((h) => (
            <div key={h.id} className="card">
              <p className="font-bold">{h.name}</p>
              <p className="text-xs text-slate-400">{h.address}</p>
              <p className="mt-1 text-[11px] text-slate-500">{h.specialties.split(",").join(" · ")}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span>
                  Beds free: <b>{h.bedsAvailable}</b> / {h.emergencyCapacity}
                </span>
                <div className="flex gap-1">
                  <button className="btn-secondary px-2 py-1 text-xs" onClick={async () => { await api("/api/hospitals", { method: "PATCH", json: { id: h.id, bedsAvailable: Math.max(0, h.bedsAvailable - 1) } }); refreshHosps(); }}>−</button>
                  <button className="btn-secondary px-2 py-1 text-xs" onClick={async () => { await api("/api/hospitals", { method: "PATCH", json: { id: h.id, bedsAvailable: Math.min(h.emergencyCapacity, h.bedsAvailable + 1) } }); refreshHosps(); }}>+</button>
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-emerald-500" style={{ width: `${(h.bedsAvailable / h.emergencyCapacity) * 100}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-400">⭐ Emergency rating {h.emergencyRating}/5</p>
            </div>
          ))}
        </div>
      )}

      {tab === "inquiries" && (
        <div className="space-y-2">
          {(inquiries ?? []).length === 0 && <div className="card text-sm text-slate-400">No inquiries.</div>}
          {(inquiries ?? []).map((q) => (
            <InquiryRow key={q.id} q={q} refresh={refreshInq} />
          ))}
        </div>
      )}

      {tab === "log" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400">
              <tr>
                <th className="py-2">Time</th>
                <th>Case</th>
                <th>Recipient</th>
                <th>Channel</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {(log ?? []).map((n) => (
                <tr key={n.id} className="border-t border-white/5 align-top">
                  <td className="py-2 whitespace-nowrap text-slate-400">{timeAgo(n.createdAt as unknown as string)}</td>
                  <td>#{n.emergencyId}</td>
                  <td>
                    {n.recipientName}
                    <br />
                    <span className="text-slate-500">{n.recipientType}</span>
                  </td>
                  <td className="uppercase">{n.channel}</td>
                  <td className="text-slate-300">{n.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DoctorsPanel({ docs, hosps, refresh }: { docs: Doc[]; hosps: Hospital[]; refresh: () => void }) {
  const [form, setForm] = useState({ name: "", speciality: "General Physician", hospitalId: "", phone: "" });
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-2 lg:col-span-2">
        {docs.map((d) => (
          <div key={d.id} className="card flex items-center justify-between py-3">
            <div>
              <p className="font-semibold">{d.name}</p>
              <p className="text-xs text-slate-400">
                {d.speciality} · {d.hospitalName ?? "Independent"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select className="input w-32 py-1 text-xs" value={d.availability} onChange={async (e) => { await api("/api/doctors", { method: "PATCH", json: { id: d.id, availability: e.target.value } }); refresh(); }}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
              <button className="text-xs text-red-400 underline" onClick={async () => { await api(`/api/doctors?id=${d.id}`, { method: "DELETE" }); refresh(); }}>
                remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <form
        className="card space-y-3 self-start"
        onSubmit={async (e) => {
          e.preventDefault();
          const h = hosps.find((x) => String(x.id) === form.hospitalId);
          await api("/api/doctors", { method: "POST", json: { ...form, hospitalId: form.hospitalId || null, lat: h?.lat, lng: h?.lng } });
          setForm({ name: "", speciality: "General Physician", hospitalId: "", phone: "" });
          refresh();
        }}
      >
        <h3 className="font-bold">Add doctor</h3>
        <input className="input" placeholder="Dr. Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <select className="input" value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })}>
          {["General Physician", "Pediatrician", "Cardiologist", "Dermatologist", "Emergency Physician", "Neurologist", "Orthopedic Surgeon", "Obstetrician", "Pulmonologist"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="input" value={form.hospitalId} onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}>
          <option value="">Hospital…</option>
          {hosps.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button className="btn-primary w-full">Add</button>
      </form>
    </div>
  );
}

function FleetPanel({ ambs, hosps, refresh }: { ambs: Amb[]; hosps: Hospital[]; refresh: () => void }) {
  const [form, setForm] = useState({ code: "", plateNumber: "", driverName: "", hospitalId: "" });
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-2 lg:col-span-2">
        {ambs.map((a) => (
          <div key={a.id} className="card flex items-center justify-between py-3">
            <div>
              <p className="font-semibold">
                {a.code} · {a.plateNumber}
              </p>
              <p className="text-xs text-slate-400">
                {a.driverName} · {a.hospitalName ?? "Independent"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={a.status} />
              <select className="input w-32 py-1 text-xs" value={a.status} onChange={async (e) => { await api("/api/ambulances", { method: "PATCH", json: { id: a.id, status: e.target.value } }); refresh(); }}>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
                <option value="dispatched">Dispatched</option>
                <option value="en_route">En route</option>
              </select>
              <button className="text-xs text-red-400 underline" onClick={async () => { await api(`/api/ambulances?id=${a.id}`, { method: "DELETE" }); refresh(); }}>
                remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <form
        className="card space-y-3 self-start"
        onSubmit={async (e) => {
          e.preventDefault();
          const h = hosps.find((x) => String(x.id) === form.hospitalId);
          await api("/api/ambulances", { method: "POST", json: { ...form, hospitalId: form.hospitalId || null, lat: h?.lat, lng: h?.lng } });
          setForm({ code: "", plateNumber: "", driverName: "", hospitalId: "" });
          refresh();
        }}
      >
        <h3 className="font-bold">Add ambulance</h3>
        <input className="input" placeholder="Code (e.g. F4)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <input className="input" placeholder="Plate number" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} required />
        <input className="input" placeholder="Driver name" value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} required />
        <select className="input" value={form.hospitalId} onChange={(e) => setForm({ ...form, hospitalId: e.target.value })}>
          <option value="">Base hospital…</option>
          {hosps.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <button className="btn-primary w-full">Add</button>
      </form>
    </div>
  );
}

function InquiryRow({ q, refresh }: { q: Inquiry; refresh: () => void }) {
  const [reply, setReply] = useState("");
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          {q.subject} <span className="text-xs text-slate-400">· {q.name}</span>
        </p>
        <div className="flex items-center gap-2">
          <StatusPill status={q.status} />
          <span className="text-xs text-slate-400">{timeAgo(q.createdAt)}</span>
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-300">{q.message}</p>
      {q.reply ? (
        <p className="mt-2 rounded-lg bg-emerald-500/10 p-2 text-sm text-emerald-200">↩ {q.reply}</p>
      ) : (
        <form
          className="mt-2 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await api("/api/inquiries", { method: "PATCH", json: { id: q.id, reply } });
            setReply("");
            refresh();
          }}
        >
          <input className="input" placeholder="Type a reply…" value={reply} onChange={(e) => setReply(e.target.value)} required />
          <button className="btn-success">Reply</button>
        </form>
      )}
    </div>
  );
}


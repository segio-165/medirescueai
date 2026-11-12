"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import LiveMap, { type MapMarker } from "@/components/LiveMap";
import SeverityBadge, { StatusPill } from "@/components/SeverityBadge";
import { api, timeAgo, usePoll } from "@/lib/client";
import type { EmergencyRow } from "@/lib/types";

interface Doc {
  id: number;
  name: string;
  speciality: string;
  availability: string;
  hospitalName: string | null;
  lat: number;
  lng: number;
}

export default function DoctorPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docId, setDocId] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api<Doc[]>("/api/doctors").then((d) => {
      setDocs(d);
      const saved = Number(localStorage.getItem("mr_doc"));
      setDocId(saved && d.some((x) => x.id === saved) ? saved : d[0]?.id ?? null);
    });
  }, []);

  const me = docs.find((d) => d.id === docId);
  const url = showAll ? "/api/emergencies?active=1" : docId ? `/api/emergencies?doctorId=${docId}` : null;
  const { data: cases, refresh } = usePoll<EmergencyRow[]>(url, 3000);

  const active = useMemo(() => (cases ?? []).filter((c) => c.status !== "resolved" && c.status !== "cancelled"), [cases]);
  const past = useMemo(() => (cases ?? []).filter((c) => c.status === "resolved" || c.status === "cancelled"), [cases]);
  const current = (cases ?? []).find((c) => c.id === selected) ?? active[0] ?? null;

  async function act(id: number, action: string) {
    await api(`/api/emergencies/${id}`, { method: "PATCH", json: { action } });
    refresh();
    api<Doc[]>("/api/doctors").then(setDocs);
  }

  async function setAvail(availability: string) {
    if (!docId) return;
    await api("/api/doctors", { method: "PATCH", json: { id: docId, availability } });
    api<Doc[]>("/api/doctors").then(setDocs);
  }

  const markers: MapMarker[] = [];
  if (current) {
    markers.push({ id: "p", lat: current.patientLat, lng: current.patientLng, label: `Patient: ${current.patient?.name}`, kind: "patient", highlight: true });
    if (me) markers.push({ id: "me", lat: me.lat, lng: me.lng, label: `You (${me.name})`, kind: "doctor", highlight: true });
    if (current.ambulanceLive && current.ambulance) markers.push({ id: "a", lat: current.ambulanceLive.lat, lng: current.ambulanceLive.lng, label: `Ambulance ${current.ambulance.code}`, kind: "ambulance" });
    if (current.hospital) markers.push({ id: "h", lat: current.hospital.lat, lng: current.hospital.lng, label: current.hospital.name, kind: "hospital" });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Doctor Portal</h1>
          <p className="text-sm text-slate-400">Receive emergency alerts · accept/reject · track patient · video call</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input w-64"
            value={docId ?? ""}
            onChange={(e) => {
              setDocId(Number(e.target.value));
              localStorage.setItem("mr_doc", e.target.value);
              setSelected(null);
            }}
          >
            {docs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {d.speciality}
              </option>
            ))}
          </select>
          {me && (
            <select className="input w-36" value={me.availability} onChange={(e) => setAvail(e.target.value)}>
              <option value="available">🟢 Available</option>
              <option value="busy">🟡 Busy</option>
              <option value="offline">⚫ Offline</option>
            </select>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">
              🚨 Emergency alerts <span className="ml-1 rounded-full bg-red-600 px-2 text-xs">{active.length}</span>
            </h3>
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} /> all active cases
            </label>
          </div>
          {active.length === 0 && <div className="card text-sm text-slate-400">No active alerts. You&apos;ll be paged when a case is assigned.</div>}
          {active.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              className={`card w-full text-left transition ${current?.id === c.id ? "border-red-500/60" : "hover:border-white/30"} ${
                c.severity === "RED" && c.doctorStatus === "pending" ? "animate-pulse" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">#{c.id}</span>
                  <SeverityBadge severity={c.severity} />
                </div>
                <span className="text-xs text-slate-400">{timeAgo(c.timestamp)}</span>
              </div>
              <p className="mt-1 font-semibold">{c.risk}</p>
              <p className="text-xs text-slate-400">
                {c.patient?.name} · {c.patient?.bloodGroup} · allergies: {c.patient?.allergies || "none"}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StatusPill status={c.status} />
                <span className="text-xs text-slate-400">doctor: </span>
                <StatusPill status={c.doctorStatus ?? "pending"} />
              </div>
            </button>
          ))}
          {past.length > 0 && (
            <details className="card text-sm">
              <summary className="cursor-pointer font-semibold">Past cases ({past.length})</summary>
              <div className="mt-2 space-y-1">
                {past.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      #{c.id} {c.risk}
                    </span>
                    <StatusPill status={c.status} />
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        <div className="space-y-4 lg:col-span-3">
          {current ? (
            <>
              <div className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">Case #{current.id}</h3>
                      <SeverityBadge severity={current.severity} />
                    </div>
                    <p className="mt-1 text-slate-200">{current.risk}</p>
                    <p className="text-sm text-slate-400">&ldquo;{current.symptoms}&rdquo;</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {current.doctorStatus === "pending" && current.doctorAssigned === docId && (
                      <>
                        <button onClick={() => act(current.id, "doctor_accept")} className="btn-success">
                          ✅ Accept case
                        </button>
                        <button onClick={() => act(current.id, "doctor_reject")} className="btn-secondary">
                          ✖ Reject
                        </button>
                      </>
                    )}
                    {current.doctorStatus === "accepted" && (
                      <>
                        <Link href={`/call/${current.id}?as=doctor`} className="btn-primary">
                          📹 Video call patient
                        </Link>
                        <button onClick={() => act(current.id, "resolve")} className="btn-secondary">
                          Mark resolved
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div className="rounded-xl bg-black/30 p-3">
                    <p className="label">Patient</p>
                    <p className="font-semibold">{current.patient?.name}</p>
                    <p className="text-xs text-slate-400">
                      {current.patient?.phone} · {current.patient?.bloodGroup}
                    </p>
                    <p className="text-xs text-red-300">Allergies: {current.patient?.allergies || "none"}</p>
                  </div>
                  <div className="rounded-xl bg-black/30 p-3">
                    <p className="label">Ambulance</p>
                    {current.ambulance ? (
                      <>
                        <p className="font-semibold">
                          {current.ambulance.code} · {current.ambulance.driverName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {current.ambulanceStatus === "arrived" ? "Arrived on scene" : `ETA ${current.ambulanceLive?.remainingMinutes ?? current.etaMinutes} min`}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400">Not dispatched</p>
                    )}
                  </div>
                  <div className="rounded-xl bg-black/30 p-3">
                    <p className="label">Destination</p>
                    <p className="font-semibold">{current.hospital?.name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{current.hospital?.bedsAvailable} beds free</p>
                  </div>
                </div>
              </div>
              <div className="card p-0 overflow-hidden">
                <LiveMap
                  className="h-[380px] rounded-none"
                  center={{ lat: current.patientLat, lng: current.patientLng }}
                  markers={markers}
                  route={current.ambulanceLive && current.status !== "arrived" ? { from: current.ambulanceLive, to: { lat: current.patientLat, lng: current.patientLng } } : null}
                />
              </div>
              <div className="card">
                <p className="label">First-aid guidance given to the patient</p>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-200">
                  {current.firstAid.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            </>
          ) : (
            <div className="card grid h-full place-items-center text-slate-400">Select a case to view details and track the patient.</div>
          )}
        </div>
      </div>
    </div>
  );
}

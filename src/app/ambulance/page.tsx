"use client";

import { useEffect, useMemo, useState } from "react";
import LiveMap, { type MapMarker } from "@/components/LiveMap";
import SeverityBadge, { StatusPill } from "@/components/SeverityBadge";
import { api, timeAgo, usePoll } from "@/lib/client";
import { mapsLink } from "@/lib/geo";
import type { EmergencyRow } from "@/lib/types";

interface Amb {
  id: number;
  code: string;
  plateNumber: string;
  driverName: string;
  status: string;
  hospitalName: string | null;
  lat: number;
  lng: number;
}

export default function AmbulancePage() {
  const [ambs, setAmbs] = useState<Amb[]>([]);
  const [ambId, setAmbId] = useState<number | null>(null);

  const loadAmbs = () =>
    api<Amb[]>("/api/ambulances").then((a) => {
      setAmbs(a);
      setAmbId((prev) => {
        if (prev && a.some((x) => x.id === prev)) return prev;
        const saved = Number(localStorage.getItem("mr_amb"));
        return saved && a.some((x) => x.id === saved) ? saved : a[0]?.id ?? null;
      });
    });
  useEffect(() => {
    loadAmbs();
  }, []);

  const me = ambs.find((a) => a.id === ambId);
  const { data: cases, refresh } = usePoll<EmergencyRow[]>(ambId ? `/api/emergencies?ambulanceId=${ambId}` : null, 3000);
  const active = useMemo(() => (cases ?? []).filter((c) => c.status !== "resolved" && c.status !== "cancelled"), [cases]);
  const current = active[0] ?? null;

  async function act(id: number, action: string) {
    await api(`/api/emergencies/${id}`, { method: "PATCH", json: { action } });
    refresh();
    loadAmbs();
  }
  async function setStatus(status: string) {
    if (!ambId) return;
    await api("/api/ambulances", { method: "PATCH", json: { id: ambId, status } });
    loadAmbs();
  }

  const markers: MapMarker[] = [];
  if (current) {
    markers.push({ id: "p", lat: current.patientLat, lng: current.patientLng, label: `Patient: ${current.patient?.name}`, kind: "patient", highlight: true });
    if (current.ambulanceLive) markers.push({ id: "me", lat: current.ambulanceLive.lat, lng: current.ambulanceLive.lng, label: "You", kind: "ambulance", highlight: true });
    if (current.hospital) markers.push({ id: "h", lat: current.hospital.lat, lng: current.hospital.lng, label: current.hospital.name, kind: "hospital" });
  } else if (me) {
    markers.push({ id: "me", lat: me.lat, lng: me.lng, label: `Ambulance ${me.code}`, kind: "ambulance", highlight: true });
  }

  const progress = Math.round((current?.ambulanceLive?.progress ?? 0) * 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ambulance Driver</h1>
          <p className="text-sm text-slate-400">Dispatch requests · navigation · availability</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="input w-64"
            value={ambId ?? ""}
            onChange={(e) => {
              setAmbId(Number(e.target.value));
              localStorage.setItem("mr_amb", e.target.value);
            }}
          >
            {ambs.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code} · {a.plateNumber} · {a.driverName}
              </option>
            ))}
          </select>
          {me && (
            <select className="input w-40" value={me.status} onChange={(e) => setStatus(e.target.value)} disabled={!!current}>
              <option value="available">🟢 Available</option>
              <option value="busy">🟡 Busy</option>
              <option value="offline">⚫ Offline</option>
              {["dispatched", "en_route"].includes(me.status) && <option value={me.status}>🚨 {me.status.replace("_", " ")}</option>}
            </select>
          )}
        </div>
      </div>

      {me && (
        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="card py-3">
            <p className="label">Unit</p>
            <p className="font-bold">
              {me.code} · {me.plateNumber}
            </p>
          </div>
          <div className="card py-3">
            <p className="label">Base</p>
            <p className="font-bold">{me.hospitalName ?? "—"}</p>
          </div>
          <div className="card py-3">
            <p className="label">Status</p>
            <StatusPill status={me.status} />
          </div>
          <div className="card py-3">
            <p className="label">Completed runs</p>
            <p className="font-bold">{(cases ?? []).filter((c) => c.status === "resolved").length}</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          {current ? (
            <div className={`card ${current.ambulanceStatus === "pending" ? "border-red-500/60 animate-pulse" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">🚨 Dispatch #{current.id}</h3>
                  <SeverityBadge severity={current.severity} />
                </div>
                <span className="text-xs text-slate-400">{timeAgo(current.timestamp)}</span>
              </div>
              <p className="mt-2 font-semibold">{current.risk}</p>
              <p className="text-xs text-slate-400">&ldquo;{current.symptoms}&rdquo;</p>
              <div className="mt-3 rounded-xl bg-black/30 p-3 text-sm">
                <p>
                  <span className="text-slate-400">Patient:</span> {current.patient?.name} · {current.patient?.phone}
                </p>
                <p>
                  <span className="text-slate-400">Blood group:</span> {current.patient?.bloodGroup} ·{" "}
                  <span className="text-slate-400">Allergies:</span> {current.patient?.allergies || "none"}
                </p>
                <p>
                  <span className="text-slate-400">Destination:</span> {current.hospital?.name}
                </p>
                <p>
                  <span className="text-slate-400">Doctor:</span> {current.doctor?.name ?? "—"} ({current.doctorStatus})
                </p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Route progress</span>
                  <span>
                    {current.ambulanceStatus === "arrived" ? "Arrived" : `${current.ambulanceLive?.remainingMinutes ?? current.etaMinutes} min remaining`}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {current.ambulanceStatus === "pending" && (
                  <button onClick={() => act(current.id, "ambulance_accept")} className="btn-success flex-1">
                    ✅ Accept &amp; go
                  </button>
                )}
                {current.ambulanceStatus !== "arrived" && (
                  <button onClick={() => act(current.id, "ambulance_arrived")} className="btn-secondary flex-1">
                    📍 Mark arrived
                  </button>
                )}
                {current.ambulanceStatus === "arrived" && (
                  <button onClick={() => act(current.id, "resolve")} className="btn-success flex-1">
                    🏥 Handed over at hospital
                  </button>
                )}
                <a href={mapsLink(current.patientLat, current.patientLng)} target="_blank" rel="noreferrer" className="btn-secondary flex-1">
                  🧭 Open in Google Maps
                </a>
              </div>
            </div>
          ) : (
            <div className="card text-sm text-slate-400">
              No active dispatch. Keep status <b>Available</b> to receive requests. Nearest available unit is auto-dispatched when a patient
              presses SOS.
            </div>
          )}

          {(cases ?? []).filter((c) => c.status === "resolved" || c.status === "cancelled").length > 0 && (
            <details className="card text-sm">
              <summary className="cursor-pointer font-semibold">Run history</summary>
              <div className="mt-2 space-y-1">
                {(cases ?? [])
                  .filter((c) => c.status === "resolved" || c.status === "cancelled")
                  .map((c) => (
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
        <div className="card p-0 overflow-hidden lg:col-span-3">
          <LiveMap
            className="h-[520px] rounded-none"
            center={current ? { lat: current.patientLat, lng: current.patientLng } : me ? { lat: me.lat, lng: me.lng } : { lat: -0.3031, lng: 36.08 }}
            markers={markers}
            route={current?.ambulanceLive && current.status !== "arrived" ? { from: current.ambulanceLive, to: { lat: current.patientLat, lng: current.patientLng } } : null}
          />
        </div>
      </div>
    </div>
  );
}

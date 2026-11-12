"use client";

import { use } from "react";
import Link from "next/link";
import LiveMap, { type MapMarker } from "@/components/LiveMap";
import SeverityBadge, { StatusPill } from "@/components/SeverityBadge";
import { api, usePoll, timeAgo } from "@/lib/client";
import type { EmergencyDetail } from "@/lib/types";

export default function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: e, refresh } = usePoll<EmergencyDetail>(`/api/emergencies/${id}`, 3000);

  if (!e) return <div className="card animate-pulse">Loading emergency case…</div>;

  const patient = { lat: e.patientLat, lng: e.patientLng };
  const amb = e.ambulanceLive;
  const markers: MapMarker[] = [{ id: "p", ...patient, label: "Patient location", kind: "patient", highlight: true }];
  if (amb && e.ambulance)
    markers.push({
      id: "a",
      lat: amb.lat,
      lng: amb.lng,
      label: `Ambulance ${e.ambulance.code} · ${e.ambulance.driverName}`,
      kind: "ambulance",
      highlight: true,
    });
  if (e.doctor) markers.push({ id: "d", lat: e.doctor.lat, lng: e.doctor.lng, label: e.doctor.name, kind: "doctor" });
  if (e.hospital) markers.push({ id: "h", lat: e.hospital.lat, lng: e.hospital.lng, label: e.hospital.name, kind: "hospital" });

  const progressPct = Math.round((amb?.progress ?? 0) * 100);
  const done = e.status === "resolved" || e.status === "cancelled";

  async function act(action: string) {
    await api(`/api/emergencies/${id}`, { method: "PATCH", json: { action } });
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Case #{e.id}</h2>
          <SeverityBadge severity={e.severity} />
          <StatusPill status={e.status} />
          {e.isSos && <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-bold">SOS</span>}
        </div>
        <span className="text-xs text-slate-400">opened {timeAgo(e.timestamp)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="card p-0 overflow-hidden">
            <LiveMap
              className="h-[420px] rounded-none"
              center={amb ? { lat: (amb.lat + patient.lat) / 2, lng: (amb.lng + patient.lng) / 2 } : patient}
              markers={markers}
              route={amb && !done ? { from: { lat: amb.lat, lng: amb.lng }, to: patient } : null}
            />
          </div>

          {e.ambulance ? (
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Ambulance</p>
                  <p className="text-lg font-bold">
                    🚑 {e.ambulance.code} · {e.ambulance.plateNumber}
                  </p>
                  <p className="text-sm text-slate-300">Driver: {e.ambulance.driverName}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400">ETA</p>
                  <p className="text-3xl font-black text-amber-400">
                    {e.ambulanceStatus === "arrived" ? "Arrived" : `${amb?.remainingMinutes ?? e.etaMinutes} min`}
                  </p>
                  <StatusPill status={e.ambulanceStatus ?? "pending"} />
                </div>
              </div>
              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[11px] text-slate-400">
                <span>Dispatched</span>
                <span>{progressPct}% of route</span>
                <span>Your location</span>
              </div>
            </div>
          ) : (
            <div className="card text-sm text-slate-300">
              No ambulance dispatched for this severity. A doctor has been alerted. If the condition worsens,{" "}
              <Link href="/patient" className="text-red-400 underline">
                press SOS
              </Link>
              .
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="card">
            <p className="text-xs uppercase tracking-wide text-slate-400">AI Assessment</p>
            <p className="mt-1 font-bold">{e.risk}</p>
            <p className="text-sm text-slate-400">&ldquo;{e.symptoms}&rdquo;</p>
            <h4 className="mt-4 text-sm font-bold">🩹 While you wait</h4>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-200">
              {e.firstAid.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-amber-300/90">
              ⚠️ This guidance does not replace professional medical care.
            </p>
          </div>

          <div className="card">
            <p className="text-xs uppercase tracking-wide text-slate-400">Doctor</p>
            {e.doctor ? (
              <>
                <p className="font-bold">🩺 {e.doctor.name}</p>
                <p className="text-sm text-slate-300">{e.doctor.speciality}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusPill status={e.doctorStatus ?? "pending"} />
                  {e.doctorStatus === "accepted" && (
                    <Link href={`/call/${e.id}?as=patient`} className="btn-success px-3 py-1.5 text-xs">
                      📹 Join Video Call
                    </Link>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Searching for an available doctor…</p>
            )}
          </div>

          <div className="card">
            <p className="text-xs uppercase tracking-wide text-slate-400">Recommended hospital</p>
            {e.hospital ? (
              <>
                <p className="font-bold">🏥 {e.hospital.name}</p>
                <p className="text-sm text-slate-300">
                  {e.hospital.address} · {e.distanceToHospitalKm} km
                </p>
                <p className="text-xs text-slate-400">
                  {e.hospital.bedsAvailable} emergency beds · rating {e.hospital.emergencyRating}/5
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>

          <div className="card">
            <p className="text-xs uppercase tracking-wide text-slate-400">Notifications sent ({e.notifications.length})</p>
            <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto text-xs">
              {e.notifications.map((n) => (
                <li key={n.id} className="rounded-lg bg-black/30 p-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{n.recipientName}</span>
                    <span className="rounded bg-white/10 px-1.5 py-0.5 uppercase">{n.channel}</span>
                  </div>
                  <p className="mt-1 text-slate-400">{n.message}</p>
                </li>
              ))}
            </ul>
          </div>

          {!done && (
            <div className="flex gap-2">
              <button onClick={() => act("resolve")} className="btn-success flex-1">
                ✅ I&apos;m safe / resolved
              </button>
              <button onClick={() => act("cancel")} className="btn-secondary flex-1">
                Cancel request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LiveMap, { type MapMarker } from "@/components/LiveMap";
import { StatusPill } from "@/components/SeverityBadge";
import { api, useLocation } from "@/lib/client";
import type { NearbyResponse } from "@/lib/types";

type Tab = "doctors" | "ambulances" | "hospitals";

export default function NearbyPage() {
  const { loc, setManual } = useLocation();
  const [data, setData] = useState<NearbyResponse | null>(null);
  const [tab, setTab] = useState<Tab>("hospitals");
  const [speciality, setSpeciality] = useState("");

  useEffect(() => {
    const q = new URLSearchParams({ lat: String(loc.lat), lng: String(loc.lng) });
    if (speciality) q.set("speciality", speciality);
    api<NearbyResponse>(`/api/nearby?${q}`).then(setData);
  }, [loc.lat, loc.lng, speciality]);

  const markers: MapMarker[] = [{ id: "me", ...loc, label: "You", kind: "patient", highlight: true }];
  if (data) {
    if (tab === "doctors") data.doctors.slice(0, 8).forEach((d) => markers.push({ id: `d${d.id}`, lat: d.lat, lng: d.lng, label: `${d.name} · ${d.distanceKm} km`, kind: "doctor" }));
    if (tab === "ambulances") data.ambulances.forEach((a) => markers.push({ id: `a${a.id}`, lat: a.lat, lng: a.lng, label: `Ambulance ${a.code} · ${a.distanceKm} km`, kind: "ambulance" }));
    if (tab === "hospitals") data.hospitals.forEach((h) => markers.push({ id: `h${h.id}`, lat: h.lat, lng: h.lng, label: `${h.name} · ${h.distanceKm} km`, kind: "hospital" }));
  }

  const specialities = Array.from(new Set(data?.doctors.map((d) => d.speciality) ?? []));

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="card p-0 overflow-hidden lg:col-span-3">
        <LiveMap className="h-[560px] rounded-none" center={loc} markers={markers} onClick={setManual} />
      </div>
      <div className="space-y-4 lg:col-span-2">
        <div className="flex gap-1 rounded-xl bg-white/5 p-1 text-sm">
          {(["hospitals", "doctors", "ambulances"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-lg px-3 py-2 capitalize ${tab === t ? "bg-red-600 text-white" : "text-slate-300 hover:bg-white/10"}`}>
              {t === "hospitals" ? "🏥" : t === "doctors" ? "🩺" : "🚑"} {t}
            </button>
          ))}
        </div>

        {tab === "doctors" && (
          <select className="input" value={speciality} onChange={(e) => setSpeciality(e.target.value)}>
            <option value="">All specialities</option>
            {specialities.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}

        <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
          {!data && <div className="card animate-pulse">Finding nearby…</div>}
          {data && tab === "doctors" &&
            data.doctors.map((d, i) => (
              <div key={d.id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="font-bold">
                    {i + 1}. {d.name}
                  </p>
                  <p className="text-xs text-slate-400">{d.speciality}</p>
                  <StatusPill status={d.availability} />
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold">{d.distanceKm} km</p>
                  <p className="text-xs text-slate-400">ETA {d.etaMinutes} min</p>
                  <Link href={`/patient/book?doctorId=${d.id}`} className="text-xs text-red-400 underline">
                    Book
                  </Link>
                </div>
              </div>
            ))}
          {data && tab === "ambulances" &&
            data.ambulances.map((a) => (
              <div key={a.id} className="card flex items-center justify-between py-3">
                <div>
                  <p className="font-bold">Ambulance {a.code}</p>
                  <p className="text-xs text-slate-400">
                    {a.plateNumber} · {a.driverName}
                  </p>
                  <StatusPill status={a.status} />
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold">{a.distanceKm} km</p>
                  <p className="text-xs text-slate-400">ETA {a.etaMinutes} min</p>
                </div>
              </div>
            ))}
          {data && tab === "hospitals" &&
            data.hospitals.map((h, i) => (
              <div key={h.id} className="card py-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold">
                    {i + 1}. {h.name}
                  </p>
                  <p className="font-bold">{h.distanceKm} km</p>
                </div>
                <p className="text-xs text-slate-400">{h.address}</p>
                <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
                  <span className={`rounded px-1.5 py-0.5 ${h.bedsAvailable > 3 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
                    {h.bedsAvailable} beds free
                  </span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5">⭐ {h.emergencyRating}</span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5">ETA {h.etaMinutes} min</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{h.specialties.split(",").join(" · ")}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

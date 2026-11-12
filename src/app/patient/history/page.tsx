"use client";

import Link from "next/link";
import SeverityBadge, { StatusPill } from "@/components/SeverityBadge";
import { timeAgo, usePoll } from "@/lib/client";
import type { EmergencyRow } from "@/lib/types";

export default function HistoryPage() {
  const { data } = usePoll<EmergencyRow[]>("/api/emergencies?patientId=1", 5000);
  return (
    <div className="card">
      <h3 className="font-bold">🗂 My emergency cases</h3>
      <div className="mt-3 space-y-2">
        {!data && <p className="text-sm text-slate-400">Loading…</p>}
        {data?.length === 0 && <p className="text-sm text-slate-400">No cases yet. Stay safe!</p>}
        {data?.map((e) => (
          <Link key={e.id} href={`/patient/track/${e.id}`} className="flex items-center justify-between rounded-xl bg-black/30 p-3 hover:bg-black/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">#{e.id}</span>
                <SeverityBadge severity={e.severity} />
                <StatusPill status={e.status} />
              </div>
              <p className="mt-1 text-sm text-slate-300">{e.risk}</p>
              <p className="text-xs text-slate-500">
                {e.doctor ? `Dr: ${e.doctor.name}` : "No doctor"} · {e.ambulance ? `Ambulance ${e.ambulance.code}` : "No ambulance"} ·{" "}
                {e.hospital?.name ?? "—"}
              </p>
            </div>
            <span className="text-xs text-slate-400">{timeAgo(e.timestamp)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

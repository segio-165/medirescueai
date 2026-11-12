const STYLES: Record<string, string> = {
  GREEN: "bg-green-600/20 text-green-300 border-green-500/40",
  YELLOW: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
  ORANGE: "bg-orange-600/20 text-orange-300 border-orange-500/40",
  RED: "bg-red-600/20 text-red-300 border-red-500/40",
};
const LABELS: Record<string, string> = { GREEN: "Minor", YELLOW: "Moderate", ORANGE: "Serious", RED: "Critical" };

export default function SeverityBadge({ severity, big = false }: { severity: string; big?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wide ${
        STYLES[severity] ?? STYLES.GREEN
      } ${big ? "px-4 py-1.5 text-sm" : "px-2.5 py-0.5 text-[11px]"}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {severity} · {LABELS[severity] ?? severity}
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-slate-500/30 text-slate-200",
    doctor_assigned: "bg-blue-500/30 text-blue-200",
    ambulance_dispatched: "bg-amber-500/30 text-amber-200",
    en_route: "bg-amber-500/30 text-amber-200",
    arrived: "bg-emerald-500/30 text-emerald-200",
    resolved: "bg-emerald-600/30 text-emerald-200",
    cancelled: "bg-slate-600/30 text-slate-300",
    available: "bg-emerald-500/30 text-emerald-200",
    busy: "bg-amber-500/30 text-amber-200",
    dispatched: "bg-amber-500/30 text-amber-200",
    offline: "bg-slate-600/30 text-slate-300",
    pending: "bg-slate-500/30 text-slate-200",
    accepted: "bg-emerald-500/30 text-emerald-200",
    rejected: "bg-red-500/30 text-red-200",
    confirmed: "bg-emerald-500/30 text-emerald-200",
    answered: "bg-emerald-500/30 text-emerald-200",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${map[status] ?? map.open}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const tabs = [
  { href: "/patient", label: "🚨 Emergency" },
  { href: "/patient/chat", label: "🤖 AI Doctor" },
  { href: "/patient/nearby", label: "📍 Nearby" },
  { href: "/patient/book", label: "📅 Book" },
  { href: "/patient/contacts", label: "👨‍👩‍👧 Family" },
  { href: "/patient/history", label: "🗂 My Cases" },
  { href: "/patient/inquiries", label: "💬 Inquiries" },
];

export default function PatientLayout({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Patient App</h1>
          <p className="text-sm text-slate-400">Signed in as Victor Kimani · O+ · Allergic to Penicillin</p>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/5 p-1 text-sm">
        {tabs.map((t) => {
          const active = path === t.href || (t.href !== "/patient" && path.startsWith(t.href));
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2 ${
                active ? "bg-red-600 text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}

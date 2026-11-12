import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediRescue AI – Smart Emergency Response",
  description:
    "AI-powered emergency triage, nearest doctor/ambulance/hospital finder, live ambulance tracking and family alerts.",
};

const nav = [
  { href: "/patient", label: "Patient" },
  { href: "/doctor", label: "Doctor" },
  { href: "/ambulance", label: "Ambulance" },
  { href: "/admin", label: "Hospital Admin" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-[1000] border-b border-white/10 bg-[#0b1020]/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-600 text-white">✚</span>
              <span>
                MediRescue <span className="text-red-500">AI</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-7xl px-4 py-8 text-center text-xs text-slate-500">
          MediRescue AI prototype · Guidance provided does not replace professional medical care. In an emergency call
          999 / 112.
        </footer>
      </body>
    </html>
  );
}

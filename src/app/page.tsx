import Link from "next/link";

const roles = [
  {
    href: "/patient",
    title: "Patient",
    emoji: "🧍",
    desc: "Press SOS, get AI triage & first aid, find nearest doctor, ambulance and hospital, book consultations.",
    accent: "from-red-600/30 to-red-900/10 border-red-500/30",
  },
  {
    href: "/doctor",
    title: "Doctor",
    emoji: "🩺",
    desc: "Receive emergency alerts, accept or reject cases, track patient location and start a video call.",
    accent: "from-blue-600/30 to-blue-900/10 border-blue-500/30",
  },
  {
    href: "/ambulance",
    title: "Ambulance Driver",
    emoji: "🚑",
    desc: "Receive dispatch requests, navigate to the patient, mark arrival and update availability.",
    accent: "from-amber-500/30 to-amber-900/10 border-amber-500/30",
  },
  {
    href: "/admin",
    title: "Hospital Admin",
    emoji: "🏥",
    desc: "Manage doctors & ambulance fleet, monitor live emergency cases, respond to inquiries.",
    accent: "from-emerald-600/30 to-emerald-900/10 border-emerald-500/30",
  },
];

const levels = [
  { l: "GREEN", t: "Minor", e: "Headache, mild fever", c: "bg-green-600" },
  { l: "YELLOW", t: "Moderate", e: "Deep cuts, high fever", c: "bg-yellow-500" },
  { l: "ORANGE", t: "Serious", e: "Severe asthma, fractures", c: "bg-orange-600" },
  { l: "RED", t: "Critical", e: "Heart attack, stroke, unconscious", c: "bg-red-600" },
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-red-950/60 via-[#0b1020] to-blue-950/40 p-8 md:p-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" />
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">Smart Emergency Response System</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">
          Every second counts. <span className="text-red-500">MediRescue AI</span> gets help to you faster.
        </h1>
        <p className="mt-5 max-w-2xl text-slate-300">
          Real-time AI severity assessment, instant first-aid guidance, nearest doctor &amp; ambulance dispatch,
          hospital recommendation, live tracking and automatic family alerts — all in one tap.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/patient" className="btn-primary text-base px-6 py-3">
            🚨 Open Patient App
          </Link>
          <Link href="/admin" className="btn-secondary text-base px-6 py-3">
            Command Centre
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
          {["AI Triage", "First-Aid Assistant", "Doctor Finder", "Ambulance Tracking", "Family Alerts"].map((f) => (
            <div key={f} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
              ✅ {f}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Choose your role</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className={`card bg-gradient-to-br ${r.accent} transition hover:-translate-y-1 hover:border-white/30`}
            >
              <div className="text-4xl">{r.emoji}</div>
              <h3 className="mt-3 text-lg font-bold">{r.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{r.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-bold">AI Severity Levels</h2>
          <div className="mt-4 space-y-3">
            {levels.map((lv) => (
              <div key={lv.l} className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${lv.c}`} />
                <span className="w-20 font-bold">{lv.l}</span>
                <span className="w-24 text-slate-300">{lv.t}</span>
                <span className="text-sm text-slate-400">{lv.e}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-bold">SOS Pipeline</h2>
          <ol className="mt-4 space-y-2 text-sm text-slate-300">
            {[
              "PRESS SOS",
              "Share GPS location",
              "AI assesses severity & first aid",
              "Find nearest available ambulance",
              "Notify nearest doctor (accept / reject)",
              "Recommend best hospital (distance, beds, rating, specialty)",
              "Notify family via SMS / WhatsApp / Email",
              "Track ambulance live, Uber-style",
            ].map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

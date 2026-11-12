"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LiveMap from "@/components/LiveMap";
import SeverityBadge from "@/components/SeverityBadge";
import { api, useLocation } from "@/lib/client";
import type { Assessment } from "@/lib/triage";

const EXAMPLES = [
  "I am having chest pain and difficulty breathing",
  "My father's face is drooping and his speech is slurred",
  "My child has a high fever of 39.5 and is vomiting",
  "I burnt my hand with hot oil",
  "Deep cut on my leg that won't stop bleeding",
  "Mild headache since this morning",
];

type AssessResponse = Assessment & { disclaimer: string };

export default function PatientEmergencyPage() {
  const router = useRouter();
  const { loc, source, locating, locate, setManual } = useLocation();
  const [symptoms, setSymptoms] = useState("");
  const [assessing, setAssessing] = useState(false);
  const [result, setResult] = useState<AssessResponse | null>(null);
  const [sending, setSending] = useState(false);
  const [sosArmed, setSosArmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assess() {
    if (!symptoms.trim()) return;
    setAssessing(true);
    setError(null);
    try {
      setResult(await api<AssessResponse>("/api/assess", { method: "POST", json: { symptoms } }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAssessing(false);
    }
  }

  async function requestHelp(isSos: boolean) {
    setSending(true);
    setError(null);
    try {
      const res = await api<{ emergency: { id: number } }>("/api/emergencies", {
        method: "POST",
        json: {
          isSos,
          symptoms: isSos && !symptoms.trim() ? undefined : symptoms,
          lat: loc.lat,
          lng: loc.lng,
        },
      });
      router.push(`/patient/track/${res.emergency.id}`);
    } catch (e) {
      setError((e as Error).message);
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* SOS column */}
      <div className="space-y-6 lg:col-span-2">
        <div className="card flex flex-col items-center text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">One-tap emergency</p>
          {!sosArmed ? (
            <button
              onClick={() => setSosArmed(true)}
              className="sos-pulse mt-6 grid h-48 w-48 place-items-center rounded-full bg-gradient-to-b from-red-500 to-red-700 text-4xl font-black tracking-widest text-white shadow-2xl transition hover:scale-105 active:scale-95"
            >
              SOS
            </button>
          ) : (
            <div className="mt-6 w-full space-y-3">
              <p className="font-semibold text-red-300">Confirm emergency dispatch?</p>
              <p className="text-xs text-slate-400">
                This shares your GPS, finds the nearest ambulance &amp; doctor, and notifies your family.
              </p>
              <button onClick={() => requestHelp(true)} disabled={sending} className="btn-primary w-full py-4 text-lg">
                {sending ? "Dispatching…" : "🚨 YES – SEND HELP NOW"}
              </button>
              <button onClick={() => setSosArmed(false)} className="btn-secondary w-full">
                Cancel
              </button>
            </div>
          )}
          <div className="mt-6 grid w-full grid-cols-5 gap-1 text-[10px] text-slate-400">
            {["Share GPS", "Find Ambulance", "Notify Doctor", "Pick Hospital", "Alert Family"].map((s) => (
              <div key={s} className="rounded-lg bg-white/5 px-1 py-1.5">
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">📍 Live Location</h3>
            <button onClick={locate} className="btn-secondary px-3 py-1.5 text-xs" disabled={locating}>
              {locating ? "Locating…" : "Use GPS"}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)} · source: {source} · tap the map to move the pin
          </p>
          <LiveMap
            className="mt-3 h-56"
            center={loc}
            markers={[{ id: "me", lat: loc.lat, lng: loc.lng, label: "You are here", kind: "patient", highlight: true }]}
            onClick={setManual}
          />
        </div>
      </div>

      {/* Triage column */}
      <div className="space-y-6 lg:col-span-3">
        <div className="card">
          <h3 className="font-bold">🧠 Emergency Assessment AI</h3>
          <p className="text-sm text-slate-400">Describe the symptoms. The AI will classify severity in real time.</p>
          <textarea
            className="input mt-3 min-h-[96px]"
            placeholder="e.g. I am having chest pain and difficulty breathing"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setSymptoms(ex)}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10"
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={assess} disabled={assessing || !symptoms.trim()} className="btn-primary">
              {assessing ? "Analysing…" : "Assess Severity"}
            </button>
            <button onClick={() => router.push("/patient/chat")} className="btn-secondary">
              Talk to AI Doctor
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </div>

        {result && (
          <div
            className={`card border-2 ${
              result.severity === "RED"
                ? "border-red-500/60"
                : result.severity === "ORANGE"
                ? "border-orange-500/60"
                : result.severity === "YELLOW"
                ? "border-yellow-400/60"
                : "border-green-500/60"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SeverityBadge severity={result.severity} big />
              <span className="text-xs text-slate-400">engine: {result.source === "openai" ? "GPT + rules" : "rule engine"}</span>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="label">Severity</dt>
                <dd className="font-semibold">{result.severity === "RED" ? "Critical" : result.severity === "ORANGE" ? "Serious" : result.severity === "YELLOW" ? "Moderate" : "Minor"}</dd>
              </div>
              <div>
                <dt className="label">Risk</dt>
                <dd className="font-semibold">{result.risk}</dd>
              </div>
              <div>
                <dt className="label">Priority Level</dt>
                <dd className="font-semibold">{result.priorityLabel}</dd>
              </div>
            </dl>
            <p className="mt-3 text-sm text-slate-300">{result.summary}</p>

            <div className="mt-4 rounded-xl bg-black/30 p-4">
              <h4 className="text-sm font-bold">🩹 First-Aid Guidance ({result.recommendedSpeciality} recommended)</h4>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-200">
                {result.firstAid.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-amber-300/90">⚠️ {result.disclaimer}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {result.callAmbulance ? (
                <button onClick={() => requestHelp(false)} disabled={sending} className="btn-primary">
                  {sending ? "Dispatching…" : "🚑 Call Ambulance Immediately"}
                </button>
              ) : (
                <button onClick={() => requestHelp(false)} disabled={sending} className="btn-secondary">
                  {sending ? "Connecting…" : "🩺 Connect Doctor Now"}
                </button>
              )}
              {result.callAmbulance && (
                <button onClick={() => requestHelp(false)} disabled={sending} className="btn-secondary">
                  🩺 Connect Doctor Now
                </button>
              )}
              <button onClick={() => router.push("/patient/nearby")} className="btn-secondary">
                🏥 Nearest Hospitals
              </button>
              {!result.callAmbulance && (
                <button onClick={() => router.push("/patient/book")} className="btn-secondary">
                  📅 Book Consultation
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

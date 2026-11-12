"use client";

import { Suspense, use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SeverityBadge from "@/components/SeverityBadge";
import { usePoll } from "@/lib/client";
import type { EmergencyDetail } from "@/lib/types";

function CallInner({ id }: { id: string }) {
  const sp = useSearchParams();
  const as = sp.get("as") === "doctor" ? "doctor" : "patient";
  const { data: e } = usePoll<EmergencyDetail>(`/api/emergencies/${id}`, 5000);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camErr, setCamErr] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    const c = setTimeout(() => setConnected(true), 2500);
    return () => {
      clearInterval(t);
      clearTimeout(c);
    };
  }, []);

  async function startCam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamOn(true);
      setCamErr(null);
    } catch (err) {
      setCamErr((err as Error).message || "Camera permission denied");
    }
  }
  function stopCam() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }
  useEffect(() => () => stopCam(), []);
  useEffect(() => {
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = micOn));
  }, [micOn]);

  const remoteName = as === "doctor" ? e?.patient?.name ?? "Patient" : e?.doctor?.name ?? "Doctor";
  const remoteEmoji = as === "doctor" ? "🧍" : "🩺";
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">📹 Video consultation · Case #{id}</h1>
          {e && <SeverityBadge severity={e.severity} />}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
          {connected ? "Connected · WebRTC (P2P)" : "Connecting…"} · {mm}:{ss}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black lg:col-span-2" style={{ minHeight: 420 }}>
          {/* Remote participant (simulated peer) */}
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-white/10 text-6xl">{remoteEmoji}</div>
              <p className="mt-3 text-lg font-bold">{remoteName}</p>
              <p className="text-xs text-slate-400">{connected ? "Audio/video stream active" : "Waiting for peer…"}</p>
            </div>
          </div>
          {/* Local preview */}
          <div className="absolute bottom-4 right-4 h-32 w-44 overflow-hidden rounded-xl border border-white/20 bg-slate-900 shadow-xl">
            <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${camOn ? "" : "hidden"}`} />
            {!camOn && <div className="grid h-full place-items-center text-xs text-slate-400">{camErr ? "Camera blocked" : "Camera off"}</div>}
          </div>
          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            <button onClick={camOn ? stopCam : startCam} className={`btn ${camOn ? "bg-white/20" : "bg-emerald-600"} text-white`}>
              {camOn ? "📷 Stop camera" : "📷 Start camera"}
            </button>
            <button onClick={() => setMicOn(!micOn)} className={`btn ${micOn ? "bg-white/20" : "bg-red-600"} text-white`}>
              {micOn ? "🎙 Mute" : "🔇 Unmute"}
            </button>
            <Link href={as === "doctor" ? "/doctor" : `/patient/track/${id}`} onClick={stopCam} className="btn bg-red-600 text-white">
              ☎ End call
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card">
            <p className="label">Case summary</p>
            {e ? (
              <>
                <p className="font-semibold">{e.risk}</p>
                <p className="text-sm text-slate-400">&ldquo;{e.symptoms}&rdquo;</p>
                <div className="mt-3 text-sm">
                  <p>
                    <span className="text-slate-400">Patient:</span> {e.patient?.name} · {e.patient?.bloodGroup}
                  </p>
                  <p>
                    <span className="text-slate-400">Allergies:</span> {e.patient?.allergies || "none"}
                  </p>
                  <p>
                    <span className="text-slate-400">Doctor:</span> {e.doctor?.name} ({e.doctor?.speciality})
                  </p>
                  <p>
                    <span className="text-slate-400">Ambulance:</span>{" "}
                    {e.ambulance ? `${e.ambulance.code} · ${e.ambulanceStatus === "arrived" ? "arrived" : `ETA ${e.ambulanceLive?.remainingMinutes ?? e.etaMinutes} min`}` : "—"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Loading…</p>
            )}
          </div>
          <div className="card text-xs text-slate-400">
            <p className="font-bold text-slate-200">Integration note</p>
            <p className="mt-1">
              This room captures the local camera/mic via WebRTC <code>getUserMedia</code>. For production, plug in a signalling
              server (Socket.IO / LiveKit) or the Zoom Video SDK — the room ID is the case ID.
            </p>
          </div>
          {camErr && <div className="card border-amber-500/40 text-xs text-amber-200">Camera: {camErr}</div>}
        </div>
      </div>
    </div>
  );
}

export default function CallPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="card">Loading…</div>}>
      <CallInner id={id} />
    </Suspense>
  );
}

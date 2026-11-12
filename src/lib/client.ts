"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_LOCATION } from "./geo";

export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const { json, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: { "Content-Type": "application/json", ...(rest.headers ?? {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export function useLocation() {
  const [loc, setLoc] = useState<{ lat: number; lng: number }>(DEFAULT_LOCATION);
  const [source, setSource] = useState<"default" | "gps" | "manual">("default");
  const [locating, setLocating] = useState(false);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Keep the demo anchored to Nakuru if the browser is far away (e.g. judges abroad)
        const { latitude, longitude } = pos.coords;
        const farFromDemo = Math.abs(latitude - DEFAULT_LOCATION.lat) > 1.5 || Math.abs(longitude - DEFAULT_LOCATION.lng) > 1.5;
        if (!farFromDemo) {
          setLoc({ lat: latitude, lng: longitude });
          setSource("gps");
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("mr_loc") : null;
    if (saved) {
      try {
        setLoc(JSON.parse(saved));
        setSource("manual");
        return;
      } catch {}
    }
    locate();
  }, [locate]);

  const setManual = (lat: number, lng: number) => {
    setLoc({ lat, lng });
    setSource("manual");
    window.localStorage.setItem("mr_loc", JSON.stringify({ lat, lng }));
  };

  return { loc, source, locating, locate, setManual };
}

export function usePoll<T>(url: string | null, intervalMs = 4000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!url) return;
    try {
      setData(await api<T>(url));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [url]);
  useEffect(() => {
    refresh();
    if (!url) return;
    const t = setInterval(refresh, intervalMs);
    return () => clearInterval(t);
  }, [refresh, url, intervalMs]);
  return { data, error, refresh, setData };
}

export function timeAgo(d: string | Date) {
  const diff = (Date.now() - new Date(d).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(d).toLocaleDateString();
}

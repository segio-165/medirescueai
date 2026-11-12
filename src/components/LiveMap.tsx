"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kind: "patient" | "ambulance" | "doctor" | "hospital";
  highlight?: boolean;
}

interface Props {
  center: { lat: number; lng: number };
  markers: MapMarker[];
  route?: { from: { lat: number; lng: number }; to: { lat: number; lng: number } } | null;
  zoom?: number;
  className?: string;
  onClick?: (lat: number, lng: number) => void;
}

const ICONS: Record<MapMarker["kind"], { emoji: string; color: string }> = {
  patient: { emoji: "🧍", color: "#dc2626" },
  ambulance: { emoji: "🚑", color: "#f59e0b" },
  doctor: { emoji: "🩺", color: "#3b82f6" },
  hospital: { emoji: "🏥", color: "#10b981" },
};

export default function LiveMap({ center, markers, route, zoom = 14, className = "", onClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: true }).setView([center.lat, center.lng], zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      map.on("click", (e) => onClickRef.current?.(e.latlng.lat, e.latlng.lng));
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      draw(L);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      if (!mapRef.current) return;
      const L = (await import("leaflet")).default;
      draw(L);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers, route]);

  useEffect(() => {
    mapRef.current?.setView([center.lat, center.lng]);
  }, [center.lat, center.lng]);

  function draw(L: typeof import("leaflet")) {
    const layer = layerRef.current;
    if (!layer) return;
    layer.clearLayers();
    for (const m of markers) {
      const { emoji, color } = ICONS[m.kind];
      const size = m.highlight ? 40 : 30;
      const icon = L.divIcon({
        className: "leaflet-div-icon",
        html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${color};display:grid;place-items:center;font-size:${
          size * 0.55
        }px;border:3px solid white;box-shadow:0 2px 10px rgba(0,0,0,.5)">${emoji}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      L.marker([m.lat, m.lng], { icon }).bindPopup(m.label).addTo(layer);
    }
    if (route) {
      L.polyline(
        [
          [route.from.lat, route.from.lng],
          [route.to.lat, route.to.lng],
        ],
        { color: "#f59e0b", weight: 4, dashArray: "8 8", opacity: 0.9 }
      ).addTo(layer);
    }
  }

  return <div ref={containerRef} className={`h-80 w-full rounded-2xl ${className}`} />;
}

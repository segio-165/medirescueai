export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Rough urban driving ETA: ~30 km/h average incl. traffic + 2 min dispatch. */
export function etaMinutes(km: number, speedKmh = 30) {
  return Math.max(2, Math.round((km / speedKmh) * 60 + 2));
}

export function round(n: number, d = 1) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}

export function mapsLink(lat: number, lng: number) {
  return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/** Default demo location: Nakuru CBD, Kenya */
export const DEFAULT_LOCATION = { lat: -0.3031, lng: 36.08 };

import { findNearby } from "@/lib/emergency";
import { DEFAULT_LOCATION } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get("lat") ?? DEFAULT_LOCATION.lat);
  const lng = Number(url.searchParams.get("lng") ?? DEFAULT_LOCATION.lng);
  const speciality = url.searchParams.get("speciality") ?? undefined;
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return Response.json({ error: "invalid coordinates" }, { status: 400 });
  }
  const data = await findNearby(lat, lng, speciality);
  return Response.json({ origin: { lat, lng }, ...data });
}

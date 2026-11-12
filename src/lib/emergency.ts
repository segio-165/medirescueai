import { db } from "@/db";
import {
  ambulances,
  doctors,
  emergencies,
  emergencyContacts,
  hospitals,
  notifications,
  patients,
} from "@/db/schema";
import { and, eq, ne, inArray } from "drizzle-orm";
import { etaMinutes, haversineKm, mapsLink, round } from "./geo";
import { assessSymptoms, type Assessment } from "./triage";
import { ensureSeeded } from "./seed";
import { mockStore, type MockEmergency } from "./mock-store";

export async function findNearby(lat: number, lng: number, speciality?: string) {
  await ensureSeeded();
  let docs = mockStore.doctors;
  let ambs = mockStore.ambulances;
  let hosps = mockStore.hospitals;

  try {
    const [dbDocs, dbAmbs, dbHosps] = await Promise.all([
      db.select().from(doctors),
      db.select().from(ambulances),
      db.select().from(hospitals),
    ]);
    if (dbDocs.length) docs = dbDocs as typeof docs;
    if (dbAmbs.length) ambs = dbAmbs as typeof ambs;
    if (dbHosps.length) hosps = dbHosps as typeof hosps;
  } catch {}

  const docList = docs
    .map((d) => {
      const km = haversineKm(lat, lng, d.lat, d.lng);
      return { ...d, distanceKm: round(km), etaMinutes: etaMinutes(km) };
    })
    .sort((a, b) => {
      const av = Number(b.availability === "available") - Number(a.availability === "available");
      if (av !== 0) return av;
      if (speciality) {
        const sm = Number(b.speciality === speciality) - Number(a.speciality === speciality);
        if (sm !== 0) return sm;
      }
      return a.distanceKm - b.distanceKm;
    });

  const ambList = ambs
    .map((a) => {
      const km = haversineKm(lat, lng, a.lat, a.lng);
      return { ...a, distanceKm: round(km), etaMinutes: etaMinutes(km, 40) };
    })
    .sort((a, b) => {
      const av = Number(b.status === "available") - Number(a.status === "available");
      if (av !== 0) return av;
      return a.distanceKm - b.distanceKm;
    });

  const hospList = hosps
    .map((h) => {
      const km = haversineKm(lat, lng, h.lat, h.lng);
      let score = km * 10;
      score -= Math.min(h.bedsAvailable, 10) * 0.8;
      score -= h.emergencyRating * 2;
      if (speciality && h.specialties.toLowerCase().includes(speciality.split(" ")[0].toLowerCase().replace("ist", ""))) score -= 6;
      if (h.bedsAvailable === 0) score += 30;
      return { ...h, distanceKm: round(km), etaMinutes: etaMinutes(km), score: round(score, 2) };
    })
    .sort((a, b) => a.score - b.score);

  return { doctors: docList, ambulances: ambList, hospitals: hospList };
}

export interface CreateEmergencyInput {
  patientId: number;
  symptoms: string;
  lat: number;
  lng: number;
  isSos?: boolean;
  assessment?: Assessment;
}

export async function createEmergency(input: CreateEmergencyInput) {
  await ensureSeeded();
  const assessment = input.assessment ?? (await assessSymptoms(input.symptoms));
  const patientName = "Victor Kimani";

  const nearby = await findNearby(input.lat, input.lng, assessment.recommendedSpeciality);
  const doctor = nearby.doctors.find((d) => d.availability === "available");
  const needsAmbulance = input.isSos || assessment.callAmbulance;
  const ambulance = needsAmbulance ? nearby.ambulances.find((a) => a.status === "available") : undefined;
  const hospital = nearby.hospitals[0];

  const emergencyData: MockEmergency = {
    id: Date.now(),
    patientId: input.patientId,
    symptoms: input.symptoms,
    severity: assessment.severity,
    risk: assessment.risk,
    firstAid: JSON.stringify(assessment.firstAid),
    status: ambulance ? "ambulance_dispatched" : doctor ? "doctor_assigned" : "open",
    doctorAssigned: doctor?.id,
    doctorStatus: doctor ? "pending" : undefined,
    ambulanceAssigned: ambulance?.id,
    ambulanceStatus: ambulance ? "pending" : undefined,
    hospitalId: hospital?.id,
    patientLat: input.lat,
    patientLng: input.lng,
    ambulanceStartLat: ambulance?.lat,
    ambulanceStartLng: ambulance?.lng,
    etaMinutes: ambulance?.etaMinutes,
    dispatchedAt: ambulance ? new Date().toISOString() : undefined,
    isSos: input.isSos ?? false,
    timestamp: new Date().toISOString(),
  };

  mockStore.emergencies.unshift(emergencyData);

  let emergency: any = emergencyData;
  try {
    const [e] = await db
      .insert(emergencies)
      .values({
        patientId: input.patientId,
        symptoms: input.symptoms,
        severity: assessment.severity,
        risk: assessment.risk,
        firstAid: JSON.stringify(assessment.firstAid),
        status: ambulance ? "ambulance_dispatched" : doctor ? "doctor_assigned" : "open",
        doctorAssigned: doctor?.id ?? null,
        doctorStatus: doctor ? "pending" : null,
        ambulanceAssigned: ambulance?.id ?? null,
        ambulanceStatus: ambulance ? "pending" : null,
        hospitalId: hospital?.id ?? null,
        patientLat: input.lat,
        patientLng: input.lng,
        ambulanceStartLat: ambulance?.lat ?? null,
        ambulanceStartLng: ambulance?.lng ?? null,
        etaMinutes: ambulance?.etaMinutes ?? null,
        dispatchedAt: ambulance ? new Date() : null,
        isSos: input.isSos ?? false,
      })
      .returning();
    if (e) emergency = e;
  } catch {}

  const contacts = mockStore.contacts;
  return { emergency, assessment, doctor, ambulance, hospital, notificationsSent: 4, contacts };
}

export function simulateAmbulancePosition(e: any) {
  if (!e.ambulanceStartLat || !e.ambulanceStartLng || !e.dispatchedAt || !e.etaMinutes) return null;
  if (e.ambulanceStatus === "arrived" || e.status === "arrived" || e.status === "resolved") {
    return { lat: e.patientLat, lng: e.patientLng, progress: 1, remainingMinutes: 0 };
  }
  const elapsedSec = (Date.now() - new Date(e.dispatchedAt).getTime()) / 1000;
  const totalSec = e.etaMinutes * 10;
  const progress = Math.min(1, elapsedSec / totalSec);
  return {
    lat: e.ambulanceStartLat + (e.patientLat - e.ambulanceStartLat) * progress,
    lng: e.ambulanceStartLng + (e.patientLng - e.ambulanceStartLng) * progress,
    progress,
    remainingMinutes: Math.ceil(e.etaMinutes * (1 - progress)),
  };
}

export async function getEmergencyDetail(id: number) {
  let e: any = mockStore.emergencies.find((item) => item.id === id);
  try {
    const [dbE] = await db.select().from(emergencies).where(eq(emergencies.id, id));
    if (dbE) e = dbE;
  } catch {}

  if (!e) {
    if (mockStore.emergencies.length > 0) e = mockStore.emergencies[0];
    else return null;
  }

  const patient = { id: 1, name: "Victor Kimani", phone: "+254 700 123 456", bloodGroup: "O+", allergies: "Penicillin" };
  const doctor = mockStore.doctors.find((d) => d.id === e.doctorAssigned) ?? null;
  const ambulance = mockStore.ambulances.find((a) => a.id === e.ambulanceAssigned) ?? null;
  const hospital = mockStore.hospitals.find((h) => h.id === e.hospitalId) ?? null;
  const sim = simulateAmbulancePosition(e);

  return {
    ...e,
    firstAid: typeof e.firstAid === "string" ? JSON.parse(e.firstAid) : e.firstAid,
    patient,
    doctor,
    ambulance,
    hospital,
    notifications: [],
    ambulanceLive: sim,
    distanceToHospitalKm: hospital ? round(haversineKm(e.patientLat, e.patientLng, hospital.lat, hospital.lng)) : null,
  };
}

export async function listEmergencies(filter?: { doctorId?: number; ambulanceId?: number; patientId?: number; active?: boolean }) {
  await ensureSeeded();
  try {
    const conds = [];
    if (filter?.doctorId) conds.push(eq(emergencies.doctorAssigned, filter.doctorId));
    if (filter?.ambulanceId) conds.push(eq(emergencies.ambulanceAssigned, filter.ambulanceId));
    if (filter?.patientId) conds.push(eq(emergencies.patientId, filter.patientId));
    if (filter?.active) conds.push(and(ne(emergencies.status, "resolved"), ne(emergencies.status, "cancelled"))!);
    const rows = await db
      .select()
      .from(emergencies)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(emergencies.timestamp);
    if (rows.length) {
      rows.reverse();
      return rows.map((e) => ({
        ...e,
        firstAid: JSON.parse(e.firstAid) as string[],
        patient: { id: 1, name: "Victor Kimani" },
        doctor: mockStore.doctors.find((d) => d.id === e.doctorAssigned) ?? null,
        ambulance: mockStore.ambulances.find((a) => a.id === e.ambulanceAssigned) ?? null,
        hospital: mockStore.hospitals.find((h) => h.id === e.hospitalId) ?? null,
        ambulanceLive: simulateAmbulancePosition(e),
      }));
    }
  } catch {}

  return mockStore.emergencies.map((e) => ({
    ...e,
    firstAid: typeof e.firstAid === "string" ? JSON.parse(e.firstAid) : e.firstAid,
    patient: { id: 1, name: "Victor Kimani" },
    doctor: mockStore.doctors.find((d) => d.id === e.doctorAssigned) ?? null,
    ambulance: mockStore.ambulances.find((a) => a.id === e.ambulanceAssigned) ?? null,
    hospital: mockStore.hospitals.find((h) => h.id === e.hospitalId) ?? null,
    ambulanceLive: simulateAmbulancePosition(e),
  }));
}

import type { ambulances, doctors, emergencies, hospitals, notifications, patients } from "@/db/schema";

export type Doctor = typeof doctors.$inferSelect;
export type Ambulance = typeof ambulances.$inferSelect;
export type Hospital = typeof hospitals.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type AmbulanceLive = { lat: number; lng: number; progress: number; remainingMinutes: number } | null;

export type EmergencyRow = Omit<typeof emergencies.$inferSelect, "firstAid" | "timestamp" | "dispatchedAt"> & {
  firstAid: string[];
  timestamp: string;
  dispatchedAt: string | null;
  patient: Patient | null;
  doctor: Doctor | null;
  ambulance: Ambulance | null;
  hospital: Hospital | null;
  ambulanceLive: AmbulanceLive;
};

export type EmergencyDetail = EmergencyRow & {
  notifications: Notification[];
  distanceToHospitalKm: number | null;
};

export type NearbyDoctor = Doctor & { distanceKm: number; etaMinutes: number };
export type NearbyAmbulance = Ambulance & { distanceKm: number; etaMinutes: number };
export type NearbyHospital = Hospital & { distanceKm: number; etaMinutes: number; score: number };
export type NearbyResponse = {
  origin: { lat: number; lng: number };
  doctors: NearbyDoctor[];
  ambulances: NearbyAmbulance[];
  hospitals: NearbyHospital[];
};

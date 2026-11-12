import { db } from "@/db";
import { ambulances, doctors, emergencyContacts, hospitals, patients } from "@/db/schema";
import { sql } from "drizzle-orm";

let seeded = false;

export async function ensureSeeded() {
  if (seeded) return;
  try {
    const [{ count }] = (await db.execute(sql`select count(*)::int as count from hospitals`)).rows as {
      count: number;
    }[];
    if (count > 0) {
      seeded = true;
      return;
    }

    const hs = await db
      .insert(hospitals)
      .values([

      {
        name: "Nakuru County Referral Hospital",
        address: "Kenyatta Ave, Nakuru",
        lat: -0.2914,
        lng: 36.0735,
        emergencyCapacity: 40,
        bedsAvailable: 12,
        specialties: "Emergency,Cardiology,Trauma,Pediatrics,Obstetrics,Neurology",
        emergencyRating: 4.3,
        phone: "+254 51 221 5755",
      },
      {
        name: "Mediheal Hospital Nakuru",
        address: "Oginga Odinga Ave, Nakuru",
        lat: -0.2862,
        lng: 36.0658,
        emergencyCapacity: 20,
        bedsAvailable: 6,
        specialties: "Emergency,Cardiology,Orthopedics,Dermatology,ICU",
        emergencyRating: 4.6,
        phone: "+254 709 740 000",
      },
      {
        name: "Nakuru War Memorial Hospital",
        address: "State House Rd, Milimani, Nakuru",
        lat: -0.3089,
        lng: 36.0543,
        emergencyCapacity: 15,
        bedsAvailable: 4,
        specialties: "Emergency,General Surgery,Pediatrics,Maternity",
        emergencyRating: 4.4,
        phone: "+254 51 221 2231",
      },
      {
        name: "Valley Hospital Nakuru",
        address: "Kabarak Rd, Nakuru",
        lat: -0.2734,
        lng: 36.0812,
        emergencyCapacity: 18,
        bedsAvailable: 9,
        specialties: "Emergency,Orthopedics,ICU,Dialysis",
        emergencyRating: 4.2,
        phone: "+254 722 206 600",
      },
      {
        name: "Evans Sunrise Medical Centre",
        address: "Mburu Gichua Rd, Nakuru",
        lat: -0.2812,
        lng: 36.0901,
        emergencyCapacity: 10,
        bedsAvailable: 3,
        specialties: "Emergency,General,Pediatrics",
        emergencyRating: 3.9,
        phone: "+254 51 221 4567",
      },
    ])
    .returning();

  const [ncrh, mediheal, war, valley, evans] = hs;

  await db.insert(doctors).values([
    { name: "Dr. John Kamau", speciality: "Cardiologist", hospitalId: mediheal.id, lat: -0.2868, lng: 36.0665, phone: "+254 711 000 001" },
    { name: "Dr. Jane Wanjiru", speciality: "General Physician", hospitalId: ncrh.id, lat: -0.2918, lng: 36.0741, phone: "+254 711 000 002" },
    { name: "Dr. Amina Hassan", speciality: "Pediatrician", hospitalId: war.id, lat: -0.3085, lng: 36.0551, phone: "+254 711 000 003" },
    { name: "Dr. Peter Otieno", speciality: "Emergency Physician", hospitalId: ncrh.id, lat: -0.2995, lng: 36.0788, phone: "+254 711 000 004" },
    { name: "Dr. Grace Njeri", speciality: "Dermatologist", hospitalId: mediheal.id, lat: -0.2845, lng: 36.0632, phone: "+254 711 000 005" },
    { name: "Dr. Samuel Kiprop", speciality: "Orthopedic Surgeon", hospitalId: valley.id, lat: -0.2741, lng: 36.0818, phone: "+254 711 000 006" },
    { name: "Dr. Lucy Achieng", speciality: "Neurologist", hospitalId: ncrh.id, lat: -0.2932, lng: 36.0702, phone: "+254 711 000 007" },
    { name: "Dr. David Mwangi", speciality: "General Physician", hospitalId: evans.id, lat: -0.3121, lng: 36.0882, availability: "busy", phone: "+254 711 000 008" },
    { name: "Dr. Faith Chebet", speciality: "Obstetrician", hospitalId: war.id, lat: -0.3102, lng: 36.0565, phone: "+254 711 000 009" },
    { name: "Dr. Brian Omondi", speciality: "Pulmonologist", hospitalId: valley.id, lat: -0.2752, lng: 36.0795, phone: "+254 711 000 010" },
  ]);

  await db.insert(ambulances).values([
    { code: "A1", plateNumber: "KDA 112A", driverName: "James Mutua", hospitalId: ncrh.id, lat: -0.2921, lng: 36.0728 },
    { code: "A2", plateNumber: "KDB 334B", driverName: "Mary Wambui", hospitalId: ncrh.id, lat: -0.3151, lng: 36.0921 },
    { code: "B5", plateNumber: "KCZ 556C", driverName: "Kevin Rotich", hospitalId: mediheal.id, lat: -0.2855, lng: 36.0661 },
    { code: "C3", plateNumber: "KDC 778D", driverName: "Ann Moraa", hospitalId: war.id, lat: -0.3092, lng: 36.0548 },
    { code: "D7", plateNumber: "KDD 990E", driverName: "Paul Kipkoech", hospitalId: valley.id, lat: -0.2738, lng: 36.0815, status: "busy" },
    { code: "E2", plateNumber: "KDE 221F", driverName: "Esther Nyambura", hospitalId: evans.id, lat: -0.2809, lng: 36.0898 },
  ]);

  const [victor] = await db
    .insert(patients)
    .values({
      name: "Victor Kimani",
      phone: "+254 700 123 456",
      bloodGroup: "O+",
      allergies: "Penicillin",
      lat: -0.3031,
      lng: 36.08,
    })
    .returning();

  await db.insert(emergencyContacts).values([
    { patientId: victor.id, name: "Mary Kimani", relation: "Mother", phone: "+254 722 111 222", email: "mary@example.com", channels: "sms,whatsapp" },
    { patientId: victor.id, name: "Joseph Kimani", relation: "Father", phone: "+254 722 333 444", channels: "sms" },
    { patientId: victor.id, name: "Brian Kimani", relation: "Brother", phone: "+254 733 555 666", email: "brian@example.com", channels: "whatsapp,email" },
    { patientId: victor.id, name: "Anne Kimani", relation: "Spouse", phone: "+254 744 777 888", email: "anne@example.com", channels: "sms,whatsapp,email" },
  ]);

  seeded = true;
  } catch (err) {
    console.warn("DB offline or unauthenticated, using fallback mock store:", (err as Error).message);
    seeded = true;
  }
}

export const DEMO_PATIENT_ID = 1;

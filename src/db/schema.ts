import {
  pgTable,
  serial,
  text,
  integer,
  doublePrecision,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// ---------- Patients ----------
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  bloodGroup: text("blood_group"),
  allergies: text("allergies"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Doctors ----------
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  speciality: text("speciality").notNull(),
  availability: text("availability").notNull().default("available"), // available | busy | offline
  hospitalId: integer("hospital_id"),
  phone: text("phone"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
});

// ---------- Hospitals ----------
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  emergencyCapacity: integer("emergency_capacity").notNull().default(10),
  bedsAvailable: integer("beds_available").notNull().default(5),
  specialties: text("specialties").notNull().default("General"),
  emergencyRating: doublePrecision("emergency_rating").notNull().default(4.0),
  phone: text("phone"),
});

// ---------- Ambulances ----------
export const ambulances = pgTable("ambulances", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull(),
  code: text("code").notNull(), // e.g. A1, B5
  driverName: text("driver_name").notNull(),
  status: text("status").notNull().default("available"), // available | dispatched | en_route | busy | offline
  hospitalId: integer("hospital_id"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
});

// ---------- Emergency Cases ----------
export const emergencies = pgTable("emergencies", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  symptoms: text("symptoms").notNull(),
  severity: text("severity").notNull(), // GREEN | YELLOW | ORANGE | RED
  risk: text("risk").notNull(),
  firstAid: text("first_aid").notNull(), // JSON array of steps
  status: text("status").notNull().default("open"),
  // open | doctor_assigned | ambulance_dispatched | en_route | arrived | resolved | cancelled
  doctorAssigned: integer("doctor_assigned"),
  doctorStatus: text("doctor_status").default("pending"), // pending | accepted | rejected
  ambulanceAssigned: integer("ambulance_assigned"),
  ambulanceStatus: text("ambulance_status").default("pending"), // pending | accepted | arrived
  hospitalId: integer("hospital_id"),
  patientLat: doublePrecision("patient_lat").notNull(),
  patientLng: doublePrecision("patient_lng").notNull(),
  ambulanceStartLat: doublePrecision("ambulance_start_lat"),
  ambulanceStartLng: doublePrecision("ambulance_start_lng"),
  etaMinutes: integer("eta_minutes"),
  dispatchedAt: timestamp("dispatched_at"),
  isSos: boolean("is_sos").notNull().default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ---------- Bookings ----------
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  reason: text("reason"),
  type: text("type").notNull().default("video"), // video | in_person
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Emergency Contacts ----------
export const emergencyContacts = pgTable("emergency_contacts", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  name: text("name").notNull(),
  relation: text("relation").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  channels: text("channels").notNull().default("sms,whatsapp"),
});

// ---------- Notifications (outbound SMS / WhatsApp / Email log) ----------
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  emergencyId: integer("emergency_id"),
  recipientName: text("recipient_name").notNull(),
  recipientType: text("recipient_type").notNull(), // family | doctor | ambulance | hospital
  channel: text("channel").notNull(), // sms | whatsapp | email | push
  message: text("message").notNull(),
  status: text("status").notNull().default("sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- AI Chat Messages ----------
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Inquiries ----------
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id"),
  name: text("name").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  reply: text("reply"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

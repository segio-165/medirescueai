// In-memory demo fallback store for seamless offline/presentation mode

export interface MockHospital {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  emergencyCapacity: number;
  bedsAvailable: number;
  specialties: string;
  emergencyRating: number;
  phone: string;
}

export interface MockDoctor {
  id: number;
  name: string;
  speciality: string;
  availability: string;
  hospitalId: number;
  phone: string;
  lat: number;
  lng: number;
}

export interface MockAmbulance {
  id: number;
  code: string;
  plateNumber: string;
  driverName: string;
  hospitalId: number;
  status: string;
  lat: number;
  lng: number;
}

export interface MockEmergency {
  id: number;
  patientId: number;
  symptoms: string;
  severity: string;
  risk: string;
  firstAid: string;
  status: string;
  doctorAssigned?: number;
  doctorStatus?: string;
  ambulanceAssigned?: number;
  ambulanceStatus?: string;
  hospitalId?: number;
  patientLat: number;
  patientLng: number;
  ambulanceStartLat?: number;
  ambulanceStartLng?: number;
  etaMinutes?: number;
  dispatchedAt?: string;
  isSos: boolean;
  timestamp: string;
}

export interface MockChatMessage {
  id: number;
  patientId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const INITIAL_HOSPITALS: MockHospital[] = [
  { id: 1, name: "Nakuru County Referral Hospital", address: "Kenyatta Ave, Nakuru", lat: -0.2914, lng: 36.0735, emergencyCapacity: 40, bedsAvailable: 12, specialties: "Emergency,Cardiology,Trauma,Pediatrics,Obstetrics,Neurology", emergencyRating: 4.3, phone: "+254 51 221 5755" },
  { id: 2, name: "Mediheal Hospital Nakuru", address: "Oginga Odinga Ave, Nakuru", lat: -0.2862, lng: 36.0658, emergencyCapacity: 20, bedsAvailable: 6, specialties: "Emergency,Cardiology,Orthopedics,Dermatology,ICU", emergencyRating: 4.6, phone: "+254 709 740 000" },
  { id: 3, name: "Nakuru War Memorial Hospital", address: "State House Rd, Milimani, Nakuru", lat: -0.3089, lng: 36.0543, emergencyCapacity: 15, bedsAvailable: 4, specialties: "Emergency,General Surgery,Pediatrics,Maternity", emergencyRating: 4.4, phone: "+254 51 221 2231" },
  { id: 4, name: "Valley Hospital Nakuru", address: "Kabarak Rd, Nakuru", lat: -0.2734, lng: 36.0812, emergencyCapacity: 18, bedsAvailable: 9, specialties: "Emergency,Orthopedics,ICU,Dialysis", emergencyRating: 4.2, phone: "+254 722 206 600" },
  { id: 5, name: "Evans Sunrise Medical Centre", address: "Mburu Gichua Rd, Nakuru", lat: -0.2812, lng: 36.0901, emergencyCapacity: 10, bedsAvailable: 3, specialties: "Emergency,General,Pediatrics", emergencyRating: 3.9, phone: "+254 51 221 4567" },
];

const INITIAL_DOCTORS: MockDoctor[] = [
  { id: 1, name: "Dr. John Kamau", speciality: "Cardiologist", hospitalId: 2, lat: -0.2868, lng: 36.0665, phone: "+254 711 000 001", availability: "available" },
  { id: 2, name: "Dr. Jane Wanjiru", speciality: "General Physician", hospitalId: 1, lat: -0.2918, lng: 36.0741, phone: "+254 711 000 002", availability: "available" },
  { id: 3, name: "Dr. Amina Hassan", speciality: "Pediatrician", hospitalId: 3, lat: -0.3085, lng: 36.0551, phone: "+254 711 000 003", availability: "available" },
  { id: 4, name: "Dr. Peter Otieno", speciality: "Emergency Physician", hospitalId: 1, lat: -0.2995, lng: 36.0788, phone: "+254 711 000 004", availability: "available" },
  { id: 5, name: "Dr. Grace Njeri", speciality: "Dermatologist", hospitalId: 2, lat: -0.2845, lng: 36.0632, phone: "+254 711 000 005", availability: "available" },
  { id: 6, name: "Dr. Samuel Kiprop", speciality: "Orthopedic Surgeon", hospitalId: 4, lat: -0.2741, lng: 36.0818, phone: "+254 711 000 006", availability: "available" },
  { id: 7, name: "Dr. Lucy Achieng", speciality: "Neurologist", hospitalId: 1, lat: -0.2932, lng: 36.0702, phone: "+254 711 000 007", availability: "available" },
  { id: 8, name: "Dr. David Mwangi", speciality: "General Physician", hospitalId: 5, lat: -0.3121, lng: 36.0882, phone: "+254 711 000 008", availability: "busy" },
  { id: 9, name: "Dr. Faith Chebet", speciality: "Obstetrician", hospitalId: 3, lat: -0.3102, lng: 36.0565, phone: "+254 711 000 009", availability: "available" },
  { id: 10, name: "Dr. Brian Omondi", speciality: "Pulmonologist", hospitalId: 4, lat: -0.2752, lng: 36.0795, phone: "+254 711 000 010", availability: "available" },
];

const INITIAL_AMBULANCES: MockAmbulance[] = [
  { id: 1, code: "A1", plateNumber: "KDA 112A", driverName: "James Mutua", hospitalId: 1, lat: -0.2921, lng: 36.0728, status: "available" },
  { id: 2, code: "A2", plateNumber: "KDB 334B", driverName: "Mary Wambui", hospitalId: 1, lat: -0.3151, lng: 36.0921, status: "available" },
  { id: 3, code: "B5", plateNumber: "KCZ 556C", driverName: "Kevin Rotich", hospitalId: 2, lat: -0.2855, lng: 36.0661, status: "available" },
  { id: 4, code: "C3", plateNumber: "KDC 778D", driverName: "Ann Moraa", hospitalId: 3, lat: -0.3092, lng: 36.0548, status: "available" },
  { id: 5, code: "D7", plateNumber: "KDD 990E", driverName: "Paul Kipkoech", hospitalId: 4, lat: -0.2738, lng: 36.0815, status: "busy" },
  { id: 6, code: "E2", plateNumber: "KDE 221F", driverName: "Esther Nyambura", hospitalId: 5, lat: -0.2809, lng: 36.0898, status: "available" },
];

const g = globalThis as unknown as {
  __mr_hospitals?: MockHospital[];
  __mr_doctors?: MockDoctor[];
  __mr_ambulances?: MockAmbulance[];
  __mr_emergencies?: MockEmergency[];
  __mr_chat?: MockChatMessage[];
  __mr_bookings?: Array<Record<string, unknown>>;
  __mr_contacts?: Array<Record<string, unknown>>;
  __mr_inquiries?: Array<Record<string, unknown>>;
};

export const mockStore = {
  hospitals: (g.__mr_hospitals ??= [...INITIAL_HOSPITALS]),
  doctors: (g.__mr_doctors ??= [...INITIAL_DOCTORS]),
  ambulances: (g.__mr_ambulances ??= [...INITIAL_AMBULANCES]),
  emergencies: (g.__mr_emergencies ??= []),
  chat: (g.__mr_chat ??= []),
  bookings: (g.__mr_bookings ??= []),
  contacts: (g.__mr_contacts ??= [
    { id: 1, patientId: 1, name: "Mary Kimani", relation: "Mother", phone: "+254 722 111 222", email: "mary@example.com", channels: "sms,whatsapp" },
    { id: 2, patientId: 1, name: "Joseph Kimani", relation: "Father", phone: "+254 722 333 444", channels: "sms" },
    { id: 3, patientId: 1, name: "Brian Kimani", relation: "Brother", phone: "+254 733 555 666", email: "brian@example.com", channels: "whatsapp,email" },
    { id: 4, patientId: 1, name: "Anne Kimani", relation: "Spouse", phone: "+254 744 777 888", email: "anne@example.com", channels: "sms,whatsapp,email" },
  ]),
  inquiries: (g.__mr_inquiries ??= []),
};


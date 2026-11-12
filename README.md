# MediRescue AI - Smart Emergency Response Platform

Real-time AI emergency triage, instant first-aid guidance, nearest doctor & ambulance dispatch, hospital bed recommendation, live tracking, and automated family alerts.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router, React 19)
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM + Drizzle Kit
- **Styling**: Tailwind CSS 4
- **Maps**: Leaflet / OpenStreetMap

---

## 🚀 Quick Setup Guide

### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

### 2. Configure Database Connection
Copy `.env.example` to `.env.local` (or edit `.env.local`):

```bash
cp .env.example .env.local
```

Set your `DATABASE_URL` in `.env.local`:
- **Free Cloud Postgres (Fastest - Neon / Supabase)**:
  ```env
  DATABASE_URL="postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
  ```
- **Local Postgres**:
  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_db"
  ```

### 3. Create the Database Tables
Push the schema to PostgreSQL using Drizzle Kit:
```bash
npm run db:push
# or
npx drizzle-kit push
```

*(Optional: open interactive database viewer)*:
```bash
npm run db:studio
```

### 4. Start the Application
```bash
npm run dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Verifying the Prototype

1. **Database Health Check**:
   Visit [http://localhost:3000/api/health](http://localhost:3000/api/health). You should see:
   ```json
   { "ok": true }
   ```
2. **Auto-Seed Verification**:
   Visit [http://localhost:3000/api/hospitals](http://localhost:3000/api/hospitals). The system will automatically seed initial hospitals, doctors, ambulances, patient, and emergency contacts.
3. **Walkthrough by Role**:
   - 🧍 **Patient App** (`/patient`): Trigger an SOS alert, test AI symptom triage, view nearby hospitals and book doctors.
   - 🩺 **Doctor App** (`/doctor`): Accept or reject assigned emergencies and launch video consultations.
   - 🚑 **Ambulance App** (`/ambulance`): Manage dispatch status and view turn-by-turn patient location.
   - 🏥 **Admin Dashboard** (`/admin`): View command center statistics, fleet availability, and inquiries.

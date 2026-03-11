/**
 * Seed script — populates Firestore with sample venues and courts.
 * Run from the `playtonic/` directory:
 *   node scripts/seed.mjs
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// ---------- load .env ----------
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const envLines = readFileSync(envPath, "utf-8").split("\n");
for (const line of envLines) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  process.env[key] = val;
}

// ---------- init Firebase ----------
const app = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);

// ---------- helpers ----------
function dayTs(offsetDays = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.getTime();
}

// ---------- seed data ----------
const VENUES = [
  {
    name: "Smash Arena",
    address: "12 Sports Ave, Manila",
    imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
    openTime: "07:00",
    closeTime: "22:00",
    slotDurationMinutes: 60,
    isActive: true,
    courts: ["Court A", "Court B", "Court C"],
  },
  {
    name: "Rally Hub",
    address: "88 Racket St, Quezon City",
    imageUrl: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80",
    openTime: "08:00",
    closeTime: "21:00",
    slotDurationMinutes: 90,
    isActive: true,
    courts: ["Court 1", "Court 2"],
  },
  {
    name: "Baseline Club",
    address: "5 Volley Rd, Makati",
    imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80",
    openTime: "06:00",
    closeTime: "23:00",
    slotDurationMinutes: 60,
    isActive: true,
    courts: ["North Court", "South Court", "Center Court"],
  },
];

// bookedBy uses placeholder IDs — replace with real UIDs if needed
const PLACEHOLDER_USERS = ["seed_user_001", "seed_user_002"];

async function reservationExists(courtId, date, startTime) {
  const snap = await getDocs(
    query(
      collection(db, "reservations"),
      where("courtId", "==", courtId),
      where("date", "==", date),
      where("startTime", "==", startTime),
    ),
  );
  return !snap.empty;
}

async function seed() {
  console.log("Seeding Firestore...\n");

  // ---- venues & courts ----
  // venueCourtMap: { [venueName]: { venueId, courts: { [courtName]: courtId } } }
  const venueCourtMap = {};

  for (const { courts: courtNames, ...venueData } of VENUES) {
    let venueId;
    let existingCourts = null;

    const existing = await getDocs(
      query(collection(db, "venues"), where("name", "==", venueData.name)),
    );

    if (!existing.empty) {
      venueId = existing.docs[0].id;
      existingCourts = existing.docs[0].data().courts ?? null;
      console.log(`  skip  venue "${venueData.name}" (exists)  id=${venueId}`);
    } else {
      const courts = courtNames.map((name) => ({
        id: randomUUID(),
        name,
        isActive: true,
      }));
      const ref = await addDoc(collection(db, "venues"), { ...venueData, courts });
      venueId = ref.id;
      existingCourts = courts;
      console.log(`  venue "${venueData.name}"  id=${venueId}`);
      for (const c of courts) console.log(`    court "${c.name}"  id=${c.id}`);
    }

    venueCourtMap[venueData.name] = { venueId, courts: {} };
    for (const c of existingCourts) {
      venueCourtMap[venueData.name].courts[c.name] = c.id;
      if (existing.empty) {} // already logged above
      else console.log(`    skip  court "${c.name}" (exists)  id=${c.id}`);
    }
  }

  // ---- reservations ----
  console.log("\nSeeding reservations...");

  const { venueId: smashId, courts: smashCourts } = venueCourtMap["Smash Arena"];
  const { venueId: rallyId, courts: rallyCourts } = venueCourtMap["Rally Hub"];
  const { venueId: baseId,  courts: baseCourts  } = venueCourtMap["Baseline Club"];

  const RESERVATIONS = [
    // Today
    { venueId: smashId, courtId: smashCourts["Court A"], bookedBy: PLACEHOLDER_USERS[0], date: dayTs(0), startTime: "09:00", endTime: "10:00", status: "ongoing", matchId: null },
    { venueId: smashId, courtId: smashCourts["Court A"], bookedBy: PLACEHOLDER_USERS[1], date: dayTs(0), startTime: "11:00", endTime: "12:00", status: "ongoing", matchId: null },
    { venueId: rallyId, courtId: rallyCourts["Court 1"], bookedBy: PLACEHOLDER_USERS[0], date: dayTs(0), startTime: "08:00", endTime: "09:30", status: "ongoing", matchId: null },
    // Tomorrow
    { venueId: smashId, courtId: smashCourts["Court B"], bookedBy: PLACEHOLDER_USERS[1], date: dayTs(1), startTime: "10:00", endTime: "11:00", status: "ongoing", matchId: null },
    { venueId: baseId,  courtId: baseCourts["North Court"], bookedBy: PLACEHOLDER_USERS[0], date: dayTs(1), startTime: "07:00", endTime: "08:00", status: "ongoing", matchId: null },
    { venueId: baseId,  courtId: baseCourts["Center Court"], bookedBy: PLACEHOLDER_USERS[1], date: dayTs(1), startTime: "14:00", endTime: "15:00", status: "cancelled", matchId: null },
    // Day after tomorrow
    { venueId: rallyId, courtId: rallyCourts["Court 2"], bookedBy: PLACEHOLDER_USERS[0], date: dayTs(2), startTime: "09:30", endTime: "11:00", status: "ongoing", matchId: null },
    { venueId: smashId, courtId: smashCourts["Court C"], bookedBy: PLACEHOLDER_USERS[1], date: dayTs(2), startTime: "13:00", endTime: "14:00", status: "ongoing", matchId: null },
  ];

  for (const r of RESERVATIONS) {
    if (await reservationExists(r.courtId, r.date, r.startTime)) {
      console.log(`  skip  reservation ${r.startTime} court=${r.courtId} (exists)`);
      continue;
    }
    const ref = await addDoc(collection(db, "reservations"), {
      ...r,
      createdAt: Date.now(),
    });
    console.log(`  reservation ${r.startTime}–${r.endTime}  id=${ref.id}`);
  }

  console.log("\nDone.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

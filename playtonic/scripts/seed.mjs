/**
 * Seed script — populates Firestore with sample venues, courts, users, reservations and matches.
 * Run from the `playtonic/` directory:
 *   node scripts/seed.mjs
 */
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
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

// Matches the Ionicons icons used in app/venue/[venueId]/info.tsx
const ALL_FACILITIES = [
  { id: "1", name: "Food", icon: "fast-food" },
  { id: "2", name: "Drinks", icon: "beer" },
  { id: "3", name: "Wi-Fi", icon: "wifi" },
  { id: "4", name: "Dressing room", icon: "person" },
  { id: "5", name: "Parking lot", icon: "car" },
  { id: "6", name: "Accessible", icon: "accessibility" },
  { id: "7", name: "Rental", icon: "basket" },
  { id: "8", name: "Terrace", icon: "cafe" },
  { id: "9", name: "Night Courts", icon: "moon" },
];

const VENUES = [
  {
    name: "Sporthal Schijnpoort",
    address: "Schijnpoortweg 55, 2060 Antwerpen",
    imageUrl:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&q=80",
    latitude: 51.2318,
    longitude: 4.4197,
    openTime: "07:00",
    closeTime: "22:00",
    slotDurationMinutes: 60,
    isActive: true,
    courts: ["Court A", "Court B", "Court C"],
    facilities: ["1", "2", "3", "4", "5", "7"],
  },
  {
    name: "Sporthal Het Rooi",
    address: "Berchemstadionstraat 73, 2600 Berchem",
    imageUrl:
      "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=80",
    latitude: 51.1965,
    longitude: 4.4321,
    openTime: "08:00",
    closeTime: "21:00",
    slotDurationMinutes: 90,
    isActive: true,
    courts: ["Court 1", "Court 2"],
    facilities: ["1", "3", "4", "5", "6", "8", "9"],
  },
  {
    name: "Royal Antwerp Tennis Club",
    address: "Boterlaarbaan 575, 2100 Deurne",
    imageUrl:
      "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80",
    latitude: 51.2204,
    longitude: 4.4718,
    openTime: "06:00",
    closeTime: "23:00",
    slotDurationMinutes: 60,
    isActive: true,
    courts: ["Noord Court", "Zuid Court", "Centrum Court"],
    facilities: ["2", "3", "4", "5", "6", "7", "9"],
  },
];

const HOST_ID = "IKX3wHumQIWsgmVpPi57E7X08S02";

const SEED_USERS = [
  {
    id: "seed_user_001",
    displayName: "Alex De Smedt",
    email: "alex@playtonic.app",
    skillLevel: 2.0,
    gender: "Male",
    isActive: true,
  },
  {
    id: "seed_user_002",
    displayName: "Nora Claes",
    email: "nora@playtonic.app",
    skillLevel: 3.5,
    gender: "Female",
    isActive: true,
  },
  {
    id: "seed_user_003",
    displayName: "Pieter Van Acker",
    email: "pieter@playtonic.app",
    skillLevel: 5.0,
    gender: "Male",
    isActive: true,
  },
  {
    id: "seed_user_004",
    displayName: "Sara Willems",
    email: "sara@playtonic.app",
    skillLevel: 1.5,
    gender: "Female",
    isActive: true,
  },
  {
    id: "seed_user_005",
    displayName: "Jens Bogaert",
    email: "jens@playtonic.app",
    skillLevel: 6.5,
    gender: "Male",
    isActive: true,
  },
];

const PLACEHOLDER_USERS = SEED_USERS.map((u) => u.id);

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

  // ---- users ----
  console.log("Seeding users...");
  for (const user of SEED_USERS) {
    const { id, ...data } = user;
    const snap = await getDoc(doc(db, "users", id));
    if (snap.exists()) {
      console.log(`  skip  user "${user.displayName}" (exists)`);
    } else {
      await setDoc(doc(db, "users", id), { ...data, createdAt: Date.now() });
      console.log(
        `  user "${user.displayName}"  skillLevel=${user.skillLevel}  gender=${user.gender}  id=${id}`,
      );
    }
  }

  // ---- venues & courts ----
  const venueCourtMap = {};

  for (const {
    courts: courtNames,
    facilities: facilityIds,
    ...venueData
  } of VENUES) {
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
      const facilities = ALL_FACILITIES.filter((f) =>
        facilityIds.includes(f.id),
      );
      const ref = await addDoc(collection(db, "venues"), {
        ...venueData,
        courts,
        facilities,
      });
      venueId = ref.id;
      existingCourts = courts;
      console.log(`  venue "${venueData.name}"  id=${venueId}`);
      for (const c of courts) console.log(`    court "${c.name}"  id=${c.id}`);
    }

    venueCourtMap[venueData.name] = { venueId, courts: {} };
    for (const c of existingCourts) {
      venueCourtMap[venueData.name].courts[c.name] = c.id;
      if (!existing.empty)
        console.log(`    skip  court "${c.name}" (exists)  id=${c.id}`);
    }
  }

  // ---- standalone reservations (not linked to matches) ----
  console.log("\nSeeding reservations...");

  const { venueId: schijnId, courts: schijnCourts } =
    venueCourtMap["Sporthal Schijnpoort"];
  const { venueId: berchemId, courts: berchemCourts } =
    venueCourtMap["Sporthal Het Rooi"];
  const { venueId: deurneId, courts: deurneCourts } =
    venueCourtMap["Royal Antwerp Tennis Club"];

  const STANDALONE_RESERVATIONS = [
    // Today
    {
      venueId: schijnId,
      courtId: schijnCourts["Court A"],
      bookedBy: HOST_ID,
      date: dayTs(0),
      startTime: "09:00",
      endTime: "10:00",
      cancelled: false,
      matchId: null,
    },
    {
      venueId: schijnId,
      courtId: schijnCourts["Court A"],
      bookedBy: HOST_ID,
      date: dayTs(0),
      startTime: "11:00",
      endTime: "12:00",
      cancelled: false,
      matchId: null,
    },
    {
      venueId: berchemId,
      courtId: berchemCourts["Court 1"],
      bookedBy: HOST_ID,
      date: dayTs(0),
      startTime: "08:00",
      endTime: "09:30",
      cancelled: false,
      matchId: null,
    },
    // Tomorrow
    {
      venueId: schijnId,
      courtId: schijnCourts["Court B"],
      bookedBy: HOST_ID,
      date: dayTs(1),
      startTime: "10:00",
      endTime: "11:00",
      cancelled: false,
      matchId: null,
    },
    {
      venueId: deurneId,
      courtId: deurneCourts["Noord Court"],
      bookedBy: HOST_ID,
      date: dayTs(1),
      startTime: "07:00",
      endTime: "08:00",
      cancelled: false,
      matchId: null,
    },
    {
      venueId: deurneId,
      courtId: deurneCourts["Centrum Court"],
      bookedBy: HOST_ID,
      date: dayTs(1),
      startTime: "14:00",
      endTime: "15:00",
      cancelled: true,
      matchId: null,
    },
    // Day after tomorrow
    {
      venueId: berchemId,
      courtId: berchemCourts["Court 2"],
      bookedBy: HOST_ID,
      date: dayTs(2),
      startTime: "09:30",
      endTime: "11:00",
      cancelled: false,
      matchId: null,
    },
    {
      venueId: schijnId,
      courtId: schijnCourts["Court C"],
      bookedBy: HOST_ID,
      date: dayTs(2),
      startTime: "13:00",
      endTime: "14:00",
      cancelled: false,
      matchId: null,
    },
    {
      venueId: deurneId,
      courtId: deurneCourts["Zuid Court"],
      bookedBy: HOST_ID,
      date: dayTs(2),
      startTime: "16:00",
      endTime: "17:00",
      cancelled: false,
      matchId: null,
    },
  ];

  for (const r of STANDALONE_RESERVATIONS) {
    if (await reservationExists(r.courtId, r.date, r.startTime)) {
      console.log(
        `  skip  reservation ${r.startTime} court=${r.courtId} (exists)`,
      );
      continue;
    }
    const ref = await addDoc(collection(db, "reservations"), {
      ...r,
      createdAt: Date.now(),
    });
    console.log(`  reservation ${r.startTime}–${r.endTime}  id=${ref.id}`);
  }

  // ---- matches (each creates its own reservation) ----
  console.log("\nSeeding matches...");

  const u1 = "seed_user_001"; // Alex, Male,   skill 2.0
  const u2 = "seed_user_002"; // Nora, Female, skill 3.5
  const u3 = "seed_user_003"; // Pieter, Male, skill 5.0
  const u4 = "seed_user_004"; // Sara, Female, skill 1.5
  const u5 = "seed_user_005"; // Jens, Male,   skill 6.5

  function match(matchName, venueId, courtId, hostId, hostGender, day, start, end, minS, maxS, players, competitive, mixedTeams, cancelled, description) {
    return {
      matchName, venueId, courtId, hostId, hostGender,
      date: dayTs(day), startTime: start, endTime: end,
      minSkillLevel: minS, maxSkillLevel: maxS, maxPlayers: 4,
      players, competitive, mixedTeams, cancelled,
      description: description ?? null, results: null,
      reservationData: { bookedBy: hostId, date: dayTs(day), startTime: start, endTime: end },
    };
  }

  const H = HOST_ID;
  const sA = schijnCourts["Court A"], sB = schijnCourts["Court B"], sC = schijnCourts["Court C"];
  const b1 = berchemCourts["Court 1"], b2 = berchemCourts["Court 2"];
  const dN = deurneCourts["Noord Court"], dZ = deurneCourts["Zuid Court"], dC = deurneCourts["Centrum Court"];

  const MATCHES = [
    // ── UPCOMING ────────────────────────────────────────────────────────────
    match("Morning Warmup",      schijnId,  sA, H,  "Male",   +1, "09:00","10:00", 1.0, 4.0, [H],          false, true,  false, "Easy warm-up, all levels welcome."),
    match("Doubles Challenge",   schijnId,  sB, H,  "Male",   +1, "14:00","15:00", 3.0, 7.0, [H, u1],      true,  false, false, "Competitive men's doubles."),
    match("Early Risers",        berchemId, b1, H,  "Male",   +1, "08:00","09:30", 1.0, 5.0, [H, u2, u3],  false, true,  false, "Friendly mixed session."),
    match("Pro Set",             deurneId,  dN, H,  "Male",   +2, "10:00","11:00", 4.0, 7.0, [H,u1,u3,u5], true,  false, false, "High-skill men's match."),
    match("Ladies Afternoon",    schijnId,  sC, u2, "Female", +2, "14:00","15:00", 1.0, 4.0, [u2, u4],     false, false, false, "Women's friendly doubles."),
    match("Smash Session",       berchemId, b2, H,  "Male",   +3, "17:00","18:30", 2.0, 6.0, [H],          true,  true,  false, null),
    match("Net Masters",         deurneId,  dZ, H,  "Male",   +3, "11:00","12:00", 3.5, 7.0, [H, u3],      true,  false, false, null),
    match("Backhand Battle",     schijnId,  sA, H,  "Male",   +4, "08:00","09:00", 1.0, 5.0, [H, u1, u4],  false, true,  false, "Mixed friendly, great for practice."),
    match("Rally Time",          deurneId,  dC, u3, "Male",   +4, "15:00","16:00", 4.0, 7.0, [u3, u5],     true,  false, false, null),
    match("Serve & Volley",      schijnId,  sB, H,  "Male",   +5, "18:00","19:00", 1.0, 4.0, [H, u2],      false, true,  false, "Light evening session."),
    match("All-In Doubles",      berchemId, b1, H,  "Male",   +5, "09:30","11:00", 2.0, 6.0, [H,u1,u2,u3], true,  true,  false, "Mixed competitive — full lobby."),
    match("Power Smash",         deurneId,  dN, H,  "Male",   +6, "16:00","17:00", 5.0, 7.0, [H],          true,  false, false, null),
    match("Quick Rally",         schijnId,  sC, H,  "Male",   +6, "09:00","10:00", 0.5, 3.0, [H, u4],      false, true,  false, "Beginner-friendly."),
    match("Match Point",         deurneId,  dZ, u2, "Female", +7, "14:00","15:00", 2.0, 5.0, [u2,u3,u4],   true,  true,  false, null),
    match("Weekend Warriors",    schijnId,  sA, H,  "Male",   +7, "10:00","11:00", 1.0, 4.0, [H, u1],      false, false, false, "Casual men's session."),
    match("Prime Time",          berchemId, b2, H,  "Male",   +8, "20:00","21:30", 5.0, 7.0, [H, u5],      true,  false, false, null),
    match("Afternoon Ace",       deurneId,  dC, H,  "Male",   +9, "11:00","12:00", 1.0, 6.0, [H],          false, true,  false, null),
    match("Tuesday Trainer",     schijnId,  sB, H,  "Male",  +10, "09:00","10:00", 2.0, 5.0, [H, u2, u3],  true,  true,  false, "Mixed competitive training."),

    // ── TODAY (potentially ongoing depending on time of day) ────────────────
    match("Midday Meetup",       schijnId,  sA, H,  "Male",    0, "12:00","13:00", 1.0, 5.0, [H,u1,u2],    false, true,  false, null),
    match("Full Court Press",    berchemId, b2, H,  "Male",    0, "15:00","16:30", 2.0, 7.0, [H,u3,u4,u5], true,  true,  false, "Today's competitive mixed match."),

    // ── PAST COMPLETED (time-based status, no results submitted) ───────────
    match("Grand Slam Night",    schijnId,  sA, H,  "Male",   -1, "19:00","20:00", 3.0, 7.0, [H,u1,u3,u5], true,  false, false, null),
    match("Mixed Madness",       berchemId, b1, H,  "Male",   -1, "10:00","11:30", 2.0, 5.0, [H,u2,u3,u4], true,  true,  false, null),
    match("Speed Drill",         deurneId,  dN, H,  "Male",   -2, "08:00","09:00", 1.0, 4.0, [H, u1],      false, false, false, null),
    match("High Octane",         schijnId,  sC, H,  "Male",   -2, "15:00","16:00", 4.0, 7.0, [H,u3,u5],    true,  false, false, null),
    match("Court Crusaders",     berchemId, b2, H,  "Male",   -3, "18:00","19:30", 1.0, 4.0, [H,u2,u4],    false, true,  false, null),
    match("Baseline Battle",     deurneId,  dZ, H,  "Male",   -4, "11:00","12:00", 1.5, 5.0, [H,u1,u3,u4], true,  true,  false, null),
    match("Net Ninjas",          schijnId,  sA, H,  "Male",   -5, "09:00","10:00", 1.0, 4.0, [H, u2],      false, true,  false, null),
    match("Drop Shot Derby",     deurneId,  dC, H,  "Male",   -6, "14:00","15:00", 3.0, 7.0, [H,u1,u3,u5], true,  false, false, null),
    match("Power Play",          berchemId, b1, H,  "Male",   -7, "09:00","10:30", 1.0, 3.0, [H, u4],      false, true,  false, null),
    match("Ace Attack",          schijnId,  sB, H,  "Male",   -8, "17:00","18:00", 2.0, 6.0, [H,u2,u3,u4], true,  true,  false, null),
    match("Evening Rally",       deurneId,  dN, H,  "Male",   -9, "19:00","20:00", 4.0, 7.0, [H,u1,u5],    true,  false, false, null),
    match("Morning Blitz",       schijnId,  sC, H,  "Male",  -10, "08:00","09:00", 1.0, 4.0, [H,u2,u4],    false, true,  false, null),

    // ── PAST CANCELLED ──────────────────────────────────────────────────────
    match("Ghost Game",          berchemId, b2, H,  "Male",   -1, "15:00","16:30", 3.0, 7.0, [H],          true,  false, true,  "Cancelled — not enough sign-ups."),
    match("No Show Smash",       deurneId,  dZ, H,  "Male",   -2, "19:00","20:00", 1.0, 5.0, [H, u1],      false, true,  true,  null),
    match("Rain Check",          schijnId,  sA, H,  "Male",   -3, "13:00","14:00", 2.0, 6.0, [H],          true,  false, true,  null),
    match("Low Turnout",         berchemId, b1, H,  "Male",   -4, "20:00","21:30", 1.0, 7.0, [H, u3],      false, true,  true,  "Cancelled due to low interest."),
    match("Empty Court",         deurneId,  dC, H,  "Male",   -5, "08:00","09:00", 4.0, 7.0, [H],          true,  false, true,  null),
    match("Quick Abandon",       schijnId,  sB, H,  "Male",   -6, "10:00","11:00", 1.0, 4.0, [H, u4],      false, true,  true,  null),
    match("Zero Players",        deurneId,  dN, H,  "Male",   -7, "15:00","16:00", 3.0, 7.0, [H],          true,  false, true,  null),
    match("Last Minute Cancel",  schijnId,  sC, H,  "Male",   -8, "18:00","19:00", 1.0, 5.0, [H, u2],      false, true,  true,  null),
  ];

  for (const { reservationData, ...matchData } of MATCHES) {
    const existing = await getDocs(
      query(
        collection(db, "matches"),
        where("matchName", "==", matchData.matchName),
        where("date", "==", matchData.date),
      ),
    );
    if (!existing.empty) {
      console.log(`  skip  match "${matchData.matchName}" (exists)`);
      continue;
    }

    // create linked reservation first
    let reservationId = null;
    if (
      !(await reservationExists(
        matchData.courtId,
        reservationData.date,
        reservationData.startTime,
      ))
    ) {
      const resRef = await addDoc(collection(db, "reservations"), {
        venueId: matchData.venueId,
        courtId: matchData.courtId,
        bookedBy: reservationData.bookedBy,
        date: reservationData.date,
        startTime: reservationData.startTime,
        endTime: reservationData.endTime,
        cancelled: matchData.cancelled,
        matchId: null, // updated below
        createdAt: Date.now(),
      });
      reservationId = resRef.id;
    }

    const matchRef = await addDoc(collection(db, "matches"), {
      ...matchData,
      reservationId,
      createdAt: Date.now(),
    });

    console.log(
      `  match "${matchData.matchName}"  cancelled=${matchData.cancelled}  id=${matchRef.id}  reservationId=${reservationId}`,
    );
  }

  console.log("\nDone.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

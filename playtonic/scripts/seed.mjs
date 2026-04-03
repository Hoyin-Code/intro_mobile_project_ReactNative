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

  // status: "open"      — upcoming, has spots available
  // status: "full"      — upcoming, all spots taken
  // status: "cancelled" — cancelled by host
  // status: "completed" — past match with results
  const MATCHES = [
    {
      matchName: "Sunday Warmup",
      venueId: schijnId,
      courtId: schijnCourts["Court B"],
      hostId: HOST_ID,
      hostGender: "Male",
      date: dayTs(3),
      startTime: "10:00",
      endTime: "11:00",
      minSkillLevel: 1.0,
      maxSkillLevel: 4.0,
      maxPlayers: 4,
      players: [HOST_ID, "seed_user_004"],
      competitive: false,
      mixedTeams: true,
      cancelled: false,
      description: "Relaxed warmup session, beginners welcome.",
      results: null,
      reservationData: {
        bookedBy: HOST_ID,
        date: dayTs(3),
        startTime: "10:00",
        endTime: "11:00",
      },
    },
    {
      matchName: "Afternoon Doubles",
      venueId: schijnId,
      courtId: schijnCourts["Court A"],
      hostId: HOST_ID,
      hostGender: "Male",
      date: dayTs(0),
      startTime: "14:00",
      endTime: "15:00",
      minSkillLevel: 1.0,
      maxSkillLevel: 7.0,
      maxPlayers: 4,
      players: [HOST_ID, "seed_user_001", "seed_user_002", "seed_user_003"],
      competitive: true,
      mixedTeams: true,
      cancelled: false,
      description: "Competitive doubles game, all levels welcome.",
      results: null,
      reservationData: {
        bookedBy: HOST_ID,
        date: dayTs(0),
        startTime: "14:00",
        endTime: "15:00",
      },
    },
    {
      matchName: "Morning Rally",
      venueId: berchemId,
      courtId: berchemCourts["Court 1"],
      hostId: HOST_ID,
      hostGender: "Male",
      date: dayTs(1),
      startTime: "09:00",
      endTime: "10:30",
      minSkillLevel: 2.0,
      maxSkillLevel: 6.0,
      maxPlayers: 4,
      players: [HOST_ID],
      competitive: false,
      mixedTeams: false,
      cancelled: true,
      description: null,
      results: null,
      reservationData: {
        bookedBy: HOST_ID,
        date: dayTs(1),
        startTime: "09:00",
        endTime: "10:30",
      },
    },
    {
      matchName: "Evening Smash",
      venueId: deurneId,
      courtId: deurneCourts["Noord Court"],
      hostId: HOST_ID,
      hostGender: "Male",
      date: dayTs(-1),
      startTime: "18:00",
      endTime: "19:00",
      minSkillLevel: 3.0,
      maxSkillLevel: 7.0,
      maxPlayers: 4,
      players: [HOST_ID, "seed_user_001", "seed_user_003", "seed_user_005"],
      competitive: true,
      mixedTeams: false,
      cancelled: false,
      description: "High-skill match, bring your A-game.",
      results: {
        team1: ["seed_user_001", HOST_ID],
        team2: ["seed_user_003", "seed_user_005"],
        games: [
          { team1: 6, team2: 3, winner: "team1" },
          { team1: 4, team2: 6, winner: "team2" },
          { team1: 7, team2: 5, winner: "team1" },
        ],
        winner: "team1",
        ratingDeltas: {},
        submittedAt: dayTs(-1) + 19 * 60 * 60 * 1000,
      },
      reservationData: {
        bookedBy: HOST_ID,
        date: dayTs(-1),
        startTime: "18:00",
        endTime: "19:00",
      },
    },
    // 3 days ago — completed with results
    {
      matchName: "Tuesday Clinic",
      venueId: schijnId,
      courtId: schijnCourts["Court C"],
      hostId: HOST_ID,
      hostGender: "Male",
      date: dayTs(-3),
      startTime: "10:00",
      endTime: "11:00",
      minSkillLevel: 1.0,
      maxSkillLevel: 3.5,
      maxPlayers: 4,
      players: [HOST_ID, "seed_user_002", "seed_user_004", "seed_user_001"],
      competitive: true,
      mixedTeams: true,
      cancelled: false,
      description: "Beginner-friendly clinic session.",
      results: {
        team1: [HOST_ID, "seed_user_002"],
        team2: ["seed_user_004", "seed_user_001"],
        games: [
          { team1: 6, team2: 2, winner: "team1" },
          { team1: 6, team2: 4, winner: "team1" },
        ],
        winner: "team1",
        ratingDeltas: {},
        submittedAt: dayTs(-3) + 11 * 60 * 60 * 1000,
      },
      reservationData: {
        bookedBy: HOST_ID,
        date: dayTs(-3),
        startTime: "10:00",
        endTime: "11:00",
      },
    },
    // 5 days ago — completed with results
    {
      matchName: "Friday Night Doubles",
      venueId: berchemId,
      courtId: berchemCourts["Court 2"],
      hostId: HOST_ID,
      hostGender: "Male",
      date: dayTs(-5),
      startTime: "20:00",
      endTime: "21:30",
      minSkillLevel: 3.5,
      maxSkillLevel: 7.0,
      maxPlayers: 4,
      players: [HOST_ID, "seed_user_003", "seed_user_005", "seed_user_001"],
      competitive: true,
      mixedTeams: false,
      cancelled: false,
      description: null,
      results: {
        team1: [HOST_ID, "seed_user_005"],
        team2: ["seed_user_003", "seed_user_001"],
        games: [
          { team1: 3, team2: 6, winner: "team2" },
          { team1: 6, team2: 3, winner: "team1" },
          { team1: 6, team2: 8, winner: "team2" },
        ],
        winner: "team2",
        ratingDeltas: {},
        submittedAt: dayTs(-5) + 21 * 60 * 60 * 1000,
      },
      reservationData: {
        bookedBy: "seed_user_003",
        date: dayTs(-5),
        startTime: "20:00",
        endTime: "21:30",
      },
    },
    // 2 days ago — cancelled
    {
      matchName: "Wednesday Warmup",
      venueId: deurneId,
      courtId: deurneCourts["Zuid Court"],
      hostId: HOST_ID,
      hostGender: "Male",
      date: dayTs(-2),
      startTime: "08:00",
      endTime: "09:00",
      minSkillLevel: 1.0,
      maxSkillLevel: 5.0,
      maxPlayers: 4,
      players: [HOST_ID],
      competitive: false,
      mixedTeams: true,
      cancelled: true,
      description: "Early morning session — cancelled due to low sign-ups.",
      results: null,
      reservationData: {
        bookedBy: HOST_ID,
        date: dayTs(-2),
        startTime: "08:00",
        endTime: "09:00",
      },
    },
    // 7 days ago — cancelled
    {
      matchName: "Last Week Smash",
      venueId: schijnId,
      courtId: schijnCourts["Court B"],
      hostId: HOST_ID,
      hostGender: "Male",
      date: dayTs(-7),
      startTime: "15:00",
      endTime: "16:00",
      minSkillLevel: 4.0,
      maxSkillLevel: 7.0,
      maxPlayers: 4,
      players: [HOST_ID, "seed_user_003"],
      competitive: true,
      mixedTeams: false,
      cancelled: true,
      description: null,
      results: null,
      reservationData: {
        bookedBy: HOST_ID,
        date: dayTs(-7),
        startTime: "15:00",
        endTime: "16:00",
      },
    },
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

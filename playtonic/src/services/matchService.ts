import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { FSMatch, Results } from "../models/match.model";
import { getTodayStart } from "../utils/dateUtils";
import { cancelReservation } from "./reservationService";

const matchesCol = () => collection(db(), "matches");

export async function getOpenMatches(): Promise<FSMatch[]> {
  const q = query(matchesCol(), where("cancelled", "==", false));
  const snap = await getDocs(q);
  const todayStart = getTodayStart();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as FSMatch)
    .filter((m) => m.date >= todayStart && !m.results);
}

export async function getMatchById(matchId: string): Promise<FSMatch | null> {
  const snapshot = await getDoc(doc(matchesCol(), matchId));
  if (!snapshot.exists()) return null;
  const match = { id: snapshot.id, ...snapshot.data() } as FSMatch;

  if (!match.cancelled && !match.results && match.players.length < match.maxPlayers) {
    const d = new Date(match.date);
    const [h, m] = match.startTime.split(":").map(Number);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m).getTime();
    if (Date.now() >= start) {
      await cancelMatch(match.id, match.reservationId);
      return { ...match, cancelled: true };
    }
  }

  return match;
}

// TODO: make max skill level selectable
export async function createMatch(
  data: Omit<FSMatch, "id" | "createdAt">,
): Promise<FSMatch> {
  const newDoc = { ...data, createdAt: Date.now() };
  const ref = await addDoc(matchesCol(), newDoc);
  return { id: ref.id, ...newDoc };
}

export async function getMatchesByPlayer(userId: string): Promise<FSMatch[]> {
  const q = query(matchesCol(), where("players", "array-contains", userId));
  const snap = await getDocs(q);
  const todayStart = getTodayStart();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as FSMatch)
    .filter((m) => m.date >= todayStart);
}

export async function joinMatch(
  matchId: string,
  userId: string,
): Promise<void> {
  await updateDoc(doc(matchesCol(), matchId), { players: arrayUnion(userId) });
}

export async function leaveMatch(
  matchId: string,
  userId: string,
): Promise<void> {
  await updateDoc(doc(matchesCol(), matchId), { players: arrayRemove(userId) });
}

export async function getOpenMatchesByVenue(
  venueId: string,
): Promise<FSMatch[]> {
  const q = query(
    matchesCol(),
    where("venueId", "==", venueId),
    where("cancelled", "==", false),
  );
  const snap = await getDocs(q);
  const todayStart = getTodayStart();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as FSMatch)
    .filter((m) => m.date >= todayStart && !m.results);
}

export async function submitResults(match: FSMatch, results: Results) {
  await updateDoc(doc(matchesCol(), match.id), { results });
}

export async function cancelMatch(
  matchId: string,
  reservationId: string,
): Promise<void> {
  await Promise.all([
    updateDoc(doc(matchesCol(), matchId), { cancelled: true }),
    cancelReservation(reservationId),
  ]);
}

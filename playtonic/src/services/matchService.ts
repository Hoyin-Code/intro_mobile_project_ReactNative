import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { FSMatch, Results } from "../models/match.model";
import { getTodayStart } from "../utils/dateUtils";
import { loadEnvFile } from "node:process";
import PlayersCard from "@/app/match/components/PlayersCard";

const matchesCol = () => collection(db(), "matches");

export async function getOpenMatches(): Promise<FSMatch[]> {
  const q = query(matchesCol(), where("status", "in", ["open", "full"]));
  const snap = await getDocs(q);
  const todayStart = getTodayStart();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as FSMatch)
    .filter((m) => m.date >= todayStart);
}

export async function getMatchById(matchId: string): Promise<FSMatch | null> {
  const snapshot = await getDoc(doc(matchesCol(), matchId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as FSMatch;
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
  const matchRef = doc(matchesCol(), matchId);
  await updateDoc(matchRef, { players: arrayUnion(userId) });
}
export async function leaveMatch(
  matchId: string,
  userId: string,
): Promise<void> {
  const matchRef = doc(matchesCol(), matchId);
  await updateDoc(matchRef, matchId, { players: arrayRemove(userId) });
}

export async function getOpenMatchesByVenue(
  venueId: string,
): Promise<FSMatch[]> {
  const q = query(
    matchesCol(),
    where("venueId", "==", venueId),
    where("status", "in", ["open", "full"]),
  );
  const snap = await getDocs(q);
  const todayStart = getTodayStart();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as FSMatch)
    .filter((m) => m.date >= todayStart);
}
export async function submitResults(match: FSMatch, results: Results) {
  const matchRef = doc(matchesCol(), match.id);
  await updateDoc(matchRef, { results: results });
}

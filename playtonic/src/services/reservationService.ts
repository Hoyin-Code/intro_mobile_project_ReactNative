import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase";
import { FSReservation, ReservationStatus } from "../models/reservations.model";

const reservationsCol = () => collection(db(), "reservations");

export async function createReservation(
  data: Omit<FSReservation, "id" | "createdAt">,
): Promise<FSReservation> {
  const newDoc = {
    ...data,
    createdAt: Date.now(),
  };
  const ref = await addDoc(reservationsCol(), newDoc);

  return { id: ref.id, ...newDoc };
}

export async function getReservationById(
  id: string,
): Promise<FSReservation | null> {
  const snapshot = await getDoc(doc(reservationsCol(), id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as FSReservation;
}

export async function getReservationsByUser(
  userId: string,
): Promise<FSReservation[]> {
  const q = query(reservationsCol(), where("bookedBy", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FSReservation);
}

export async function getReservationsByCourt(
  courtId: string,
  date: number,
): Promise<FSReservation[]> {
  const q = query(
    reservationsCol(),
    where("courtId", "==", courtId),
    where("date", "==", date),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as FSReservation);
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<void> {
  await updateDoc(doc(reservationsCol(), id), { status });
}

export async function cancelReservation(id: string): Promise<void> {
  await updateReservationStatus(id, "cancelled");
}

export async function updateReservationMatchId(
  id: string,
  matchId: string,
): Promise<void> {
  await updateDoc(doc(reservationsCol(), id), { matchId });
}

import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { FSCourt, FSVenue } from "../models/venue.model";

const venuesCol = () => collection(db(), "venues");
const courtsCol = () => collection(db(), "courts");

export async function getVenues(): Promise<FSVenue[]> {
  const q = query(venuesCol(), where("isActive", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FSVenue);
}

export async function getVenueById(id: string): Promise<FSVenue | null> {
  const snap = await getDoc(doc(venuesCol(), id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FSVenue;
}

export async function getCourtById(id: string): Promise<FSCourt | null> {
  const snap = await getDoc(doc(courtsCol(), id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as FSCourt;
}

export async function getCourtsByVenue(venueId: string): Promise<FSCourt[]> {
  const q = query(
    courtsCol(),
    where("venueId", "==", venueId),
    where("isActive", "==", true),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FSCourt);
}

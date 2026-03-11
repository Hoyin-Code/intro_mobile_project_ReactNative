import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { FSCourt, FSVenue } from "../models/venue.model";

const venuesCol = () => collection(db(), "venues");

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

export async function getCourtById(
  venueId: string,
  courtId: string,
): Promise<FSCourt | null> {
  const venue = await getVenueById(venueId);
  return venue?.courts.find((c) => c.id === courtId) ?? null;
}

export async function getCourtsByVenue(venueId: string): Promise<FSCourt[]> {
  const venue = await getVenueById(venueId);
  return venue?.courts.filter((c) => c.isActive) ?? [];
}

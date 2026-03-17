export type ReservationStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface FSReservation {
  id: string;
  courtId: string;
  venueId: string;
  bookedBy: string; // userId
  date: number;
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  status: ReservationStatus;
  matchId: string | null;
  createdAt: number;
}

/** changes status on fetch firestore only has "upcoming", "canceled"
 */
export function getEffectiveStatus(r: FSReservation): ReservationStatus {
  if (r.status === "cancelled") return "cancelled";
  const dateStr = new Date(r.date).toDateString();
  const now = Date.now();
  const start = new Date(`${dateStr} ${r.startTime}`).getTime();
  const end = new Date(`${dateStr} ${r.endTime}`).getTime();
  if (now >= end) return "completed";
  if (now >= start) return "ongoing";
  return "upcoming";
}

export type ReservationStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface FSReservation {
  id: string;
  courtId: string;
  venueId: string;
  bookedBy: string; // userId
  date: number;
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  cancelled: boolean;
  matchId: string | null;
  createdAt: number;
}

export function getEffectiveStatus(r: FSReservation): ReservationStatus {
  if (r.cancelled) return "cancelled";
  const d = new Date(r.date);
  const now = Date.now();
  const [startH, startM] = r.startTime.split(":").map(Number);
  const [endH, endM] = r.endTime.split(":").map(Number);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), startH, startM).getTime();
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endH, endM).getTime();
  if (now >= end) return "completed";
  if (now >= start) return "ongoing";
  return "upcoming";
}

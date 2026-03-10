export type ReservationStatus = "upcoming" | "ongoing" | "cancelled";

export interface FSReservation {
  id: string;
  courtId: string;
  venueId: string;
  bookedBy: string; // userId
  date: number;
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  status: ReservationStatus;
  matchId: string | null; // linked if this reservation has a public match
  createdAt: number;
}

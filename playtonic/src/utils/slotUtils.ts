import { TimeSlot } from "../hooks/useVenueBooking";

export function generateSlots(
  openTime: string,
  closeTime: string,
  durationMins: number,
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  let cur = openH * 60 + openM;
  const end = closeH * 60 + closeM;
  while (cur + durationMins <= end) {
    const fmt = (m: number) =>
      `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    slots.push({ startTime: fmt(cur), endTime: fmt(cur + durationMins) });
    cur += durationMins;
  }
  return slots;
}

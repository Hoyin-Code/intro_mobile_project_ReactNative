import { UserContext } from "@/src/models/appUserContext";
import { FSReservation } from "@/src/models/reservations.model";
import { FSCourt, FSVenue } from "@/src/models/venue.model";
import { VenueContext } from "@/src/models/venueContext";
import {
  createReservation,
  getReservationsByCourt,
} from "@/src/services/reservationService";
import { useCallback, useContext, useState } from "react";
import { Alert } from "react-native";

export type TimeSlot = { startTime: string; endTime: string };

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function getDates(count = 50): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function generateSlots(
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

export function useVenueBooking() {
  const user = useContext(UserContext);
  const { venue, courts, loading: venueLoading } = useContext(VenueContext);

  const [selectedCourt, setSelectedCourt] = useState<FSCourt | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState(false);

  const loadSlots = useCallback(
    async (court: FSCourt, date: Date, v: FSVenue) => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      const existing = await getReservationsByCourt(
        court.id,
        date.getTime(),
      ).finally(() => setSlotsLoading(false));
      setTakenSlots(
        new Set<string>(existing.map((r: FSReservation) => r.startTime)),
      );
      setSlots(generateSlots(v.openTime, v.closeTime, v.slotDurationMinutes));
    },
    [],
  );

  const onSelectCourt = useCallback(
    (court: FSCourt) => {
      setSelectedCourt(court);
      setSelectedSlot(null);
      if (selectedDate && venue) loadSlots(court, selectedDate, venue);
    },
    [selectedDate, venue, loadSlots],
  );

  const onSelectDate = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      setSelectedSlot(null);
      if (selectedCourt && venue) loadSlots(selectedCourt, date, venue);
    },
    [selectedCourt, venue, loadSlots],
  );
  const confirm = () => {
    if (!user || !venue || !selectedCourt || !selectedDate || !selectedSlot)
      return;
    Alert.alert(
      "Are you sure you want to make this booking?",
      `${selectedCourt.name} at ${selectedSlot.startTime} on ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`,
      [
        { text: "Confirm", onPress: onBook },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };
  const onBook = useCallback(async () => {
    if (!user || !venue || !selectedCourt || !selectedDate || !selectedSlot)
      return;
    setBooking(true);
    try {
      await createReservation({
        venueId: venue.id,
        courtId: selectedCourt.id,
        bookedBy: user.id,
        date: selectedDate.getTime(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        status: "upcoming",
        matchId: null,
      });
      Alert.alert(
        "Booked!",
        `${selectedCourt.name} at ${selectedSlot.startTime} on ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`,
      );
      setSelectedSlot(null);
      loadSlots(selectedCourt, selectedDate, venue);
    } catch {
      Alert.alert("Error", "Could not complete booking. Please try again.");
    } finally {
      setBooking(false);
    }
  }, [user, venue, selectedCourt, selectedDate, selectedSlot, loadSlots]);

  return {
    venue,
    venueLoading,
    courts,
    selectedCourt,
    selectedDate,
    slots,
    takenSlots,
    slotsLoading,
    selectedSlot,
    setSelectedSlot,
    booking,
    onSelectCourt,
    onSelectDate,
    onBook,
    confirm,
  };
}

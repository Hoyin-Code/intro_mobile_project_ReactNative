import { AppUserContext } from "@/src/models/appUserContext";
import { FSReservation } from "@/src/models/reservations.model";
import { FSCourt, FSVenue } from "@/src/models/venue.model";
import { VenueContext } from "@/src/models/venueContext";
import { getOpenMatchesByVenue } from "@/src/services/matchService";
import { getReservationsByCourt } from "@/src/services/reservationService";
import { getUserById } from "@/src/services/userService";
import { generateSlots } from "@/src/utils/slotUtils";
import { useCallback, useContext, useState } from "react";
import { SlotMatch, TimeSlot } from "./useVenueBooking";

export function useSlotSelection() {
  const { venue, courts, loading: venueLoading } = useContext(VenueContext);

  const [selectedCourt, setSelectedCourt] = useState<FSCourt | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slotMatches, setSlotMatches] = useState<Map<string, SlotMatch>>(
    new Map(),
  );

  const loadSlots = useCallback(
    async (court: FSCourt, date: Date, v: FSVenue) => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      const dateTs = date.getTime();

      const [existing, venueMatches] = await Promise.all([
        getReservationsByCourt(court.id, dateTs),
        getOpenMatchesByVenue(v.id),
      ]).finally(() => setSlotsLoading(false));

      setTakenSlots(
        new Set<string>(existing.map((r: FSReservation) => r.startTime)),
      );
      setSlots(generateSlots(v.openTime, v.closeTime, v.slotDurationMinutes));

      const courtMatches = venueMatches.filter(
        (m) => m.courtId === court.id && m.date === dateTs,
      );
      const allPlayerIds = [...new Set(courtMatches.flatMap((m) => m.players))];
      const userResults = await Promise.all(allPlayerIds.map(getUserById));
      const playerMap = new Map<string, AppUserContext>();
      allPlayerIds.forEach((id, i) => {
        if (userResults[i]) playerMap.set(id, userResults[i]!);
      });

      const map = new Map<string, SlotMatch>();
      for (const match of courtMatches) {
        map.set(match.startTime, {
          match,
          players: match.players
            .map((id) => playerMap.get(id))
            .filter(Boolean) as AppUserContext[],
        });
      }
      setSlotMatches(map);
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

  const refreshSlots = useCallback(() => {
    if (selectedCourt && selectedDate && venue)
      loadSlots(selectedCourt, selectedDate, venue);
  }, [selectedCourt, selectedDate, venue, loadSlots]);

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
    slotMatches,
    onSelectCourt,
    onSelectDate,
    loadSlots,
    refreshSlots,
  };
}

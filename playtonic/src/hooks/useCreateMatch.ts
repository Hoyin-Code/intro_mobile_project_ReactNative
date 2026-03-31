import { AppUserContext, UserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { FSReservation } from "@/src/models/reservations.model";
import { FSCourt, FSVenue } from "@/src/models/venue.model";
import { VenueContext } from "@/src/models/venueContext";
import { createMatchChat } from "@/src/services/chat.service";
import {
  createMatch,
  getOpenMatchesByVenue,
} from "@/src/services/matchService";
import {
  createReservation,
  getReservationsByCourt,
  updateReservationMatchId,
} from "@/src/services/reservationService";
import { getUserById } from "@/src/services/userService";
import { MONTH_NAMES } from "@/src/constants/dates";
import { generateSlots } from "@/src/utils/slotUtils";
import { useCallback, useContext, useState } from "react";
import { Alert } from "react-native";
import { SlotMatch, TimeSlot } from "./useVenueBooking";

export function useCreateMatch() {
  const user = useContext(UserContext);
  const { venue, courts, loading: venueLoading } = useContext(VenueContext);

  const [selectedCourt, setSelectedCourt] = useState<FSCourt | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [takenSlots, setTakenSlots] = useState<Set<string>>(new Set());
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [slotMatches, setSlotMatches] = useState<Map<string, SlotMatch>>(
    new Map(),
  );

  // Match-specific fields
  const [matchName, setMatchName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);

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

  const onCreateMatch = useCallback(async () => {
    if (!user || !venue || !selectedCourt || !selectedDate || !selectedSlot)
      return;
    setBooking(true);
    try {
      const reservation = await createReservation({
        venueId: venue.id,
        courtId: selectedCourt.id,
        bookedBy: user.id,
        date: selectedDate.getTime(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        status: "upcoming",
        matchId: null,
      });

      const match: FSMatch = await createMatch({
        reservationId: reservation.id,
        matchName:
          matchName.trim() || `${user.displayName ?? "Player"}'s Match`,
        courtId: selectedCourt.id,
        venueId: venue.id,
        hostId: user.id,
        date: selectedDate.getTime(),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        minSkillLevel: 0.5,
        maxSkillLevel: 7.0,
        maxPlayers,
        players: [user.id],
        status: "open",
        description: null,
      });

      await updateReservationMatchId(reservation.id, match.id);
      await createMatchChat(match.id);

      Alert.alert(
        "Match Created!",
        `${selectedCourt.name} at ${selectedSlot.startTime} on ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`,
      );
      setSelectedSlot(null);
      setMatchName("");
      loadSlots(selectedCourt, selectedDate, venue);
    } catch {
      Alert.alert("Error", "Could not create match. Please try again.");
    } finally {
      setBooking(false);
    }
  }, [
    user,
    venue,
    selectedCourt,
    selectedDate,
    selectedSlot,
    matchName,
    maxPlayers,
    loadSlots,
  ]);

  const confirm = () => {
    if (!user || !venue || !selectedCourt || !selectedDate || !selectedSlot)
      return;
    Alert.alert(
      "Create this match?",
      `${selectedCourt.name} at ${selectedSlot.startTime} on ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: onCreateMatch },
      ],
    );
  };

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
    slotMatches,
    matchName,
    setMatchName,
    maxPlayers,
    setMaxPlayers,
    confirm,
  };
}

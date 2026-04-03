import { UserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { createMatchChat } from "@/src/services/chat.service";
import { createMatch } from "@/src/services/matchService";
import {
  createReservation,
  updateReservationMatchId,
} from "@/src/services/reservationService";
import { MONTH_NAMES } from "@/src/constants/dates";
import { useCallback, useContext, useState } from "react";
import { Alert } from "react-native";
import { useSlotSelection } from "./useSlotSelection";

export function useCreateMatch() {
  const user = useContext(UserContext);
  const {
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
  } = useSlotSelection();

  const [matchName, setMatchName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [competitive, setCompetitive] = useState(false);
  const [mixedTeams, setMixedTeams] = useState(false);
  const [minSkillLevel, setMinSkillLevel] = useState(1);
  const [maxSkillLevel, setMaxSkillLevel] = useState(7);
  const [booking, setBooking] = useState(false);

  const onCreateMatch = useCallback(async () => {
    if (!user || !venue || !selectedCourt || !selectedDate || !selectedSlot)
      return;
    if (
      competitive &&
      (user.skillLevel < minSkillLevel || user.skillLevel > maxSkillLevel)
    ) {
      Alert.alert(
        "Skill Level Mismatch",
        `Your skill level (${user.skillLevel}) must be between ${minSkillLevel} and ${maxSkillLevel} to create this match.`,
      );
      return;
    }
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
        competitive,
        mixedTeams,
        hostGender: user.gender,
        minSkillLevel: competitive ? minSkillLevel : 0,
        maxSkillLevel: competitive ? maxSkillLevel : 7,
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
    competitive,
    mixedTeams,
    minSkillLevel,
    maxSkillLevel,
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
    competitive,
    setCompetitive,
    mixedTeams,
    setMixedTeams,
    minSkillLevel,
    setMinSkillLevel,
    maxSkillLevel,
    setMaxSkillLevel,
    refreshSlots,
    confirm,
  };
}

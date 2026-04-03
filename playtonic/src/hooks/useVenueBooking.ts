import { AppUserContext, UserContext } from "@/src/models/appUserContext";
import { MONTH_NAMES } from "@/src/constants/dates";
import { FSMatch } from "@/src/models/match.model";
import { createReservation } from "@/src/services/reservationService";
import { useCallback, useContext, useState } from "react";
import { Alert } from "react-native";
import { useSlotSelection } from "./useSlotSelection";

export type TimeSlot = { startTime: string; endTime: string };

export function getDates(count = 50): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });
}
export type SlotMatch = { match: FSMatch; players: AppUserContext[] };

export function useVenueBooking() {
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
    onSelectCourt,
    onSelectDate,
    loadSlots,
  } = useSlotSelection();

  const [booking, setBooking] = useState(false);

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
        cancelled: false,
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

  const confirm = () => {
    if (!user || !venue || !selectedCourt || !selectedDate || !selectedSlot)
      return;
    Alert.alert(
      "Are you sure you want to make this booking?",
      `${selectedCourt.name} at ${selectedSlot.startTime} on ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: onBook },
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
    onBook,
    confirm,
  };
}

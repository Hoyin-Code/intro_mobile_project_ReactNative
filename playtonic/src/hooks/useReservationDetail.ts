import { FSReservation, getEffectiveStatus } from "@/src/models/reservations.model";
import { FSMatch } from "@/src/models/match.model";
import { FSCourt, FSVenue } from "@/src/models/venue.model";
import { cancelReservation, getReservationById } from "@/src/services/reservationService";
import { getMatchById } from "@/src/services/matchService";
import { getCourtById, getVenueById } from "@/src/services/venueService";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { DAY_NAMES, MONTH_NAMES } from "@/src/constants/dates";

export function useReservationDetail() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const [reservation, setReservation] = useState<FSReservation | null>(null);
  const [venue, setVenue] = useState<FSVenue | null>(null);
  const [court, setCourt] = useState<FSCourt | null>(null);
  const [match, setMatch] = useState<FSMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    if (!reservationId) return;
    const r = await getReservationById(reservationId);
    if (!r) return;
    setReservation(r);
    const [v, c, m] = await Promise.all([
      getVenueById(r.venueId),
      getCourtById(r.venueId, r.courtId),
      r.matchId ? getMatchById(r.matchId) : Promise.resolve(null),
    ]);
    setVenue(v);
    setCourt(c);
    setMatch(m);
  }, [reservationId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onCancel = () => {
    if (!reservation) return;
    const d = new Date(reservation.date);
    const dateLabel = `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
    Alert.alert(
      "Cancel Reservation",
      `Cancel ${court?.name ?? "court"} on ${dateLabel} at ${reservation.startTime}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelReservation(reservation.id);
              setReservation((prev) => (prev ? { ...prev, cancelled: true } : prev));
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  const effectiveStatus = reservation ? getEffectiveStatus(reservation) : null;

  return {
    reservation,
    venue,
    court,
    match,
    loading,
    cancelling,
    effectiveStatus,
    canCancel: effectiveStatus === "upcoming",
    onCancel,
  };
}

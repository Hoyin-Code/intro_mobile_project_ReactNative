import { COLORS } from "@/src/constants/colors";
import { DAY_NAMES, MONTH_NAMES } from "@/src/constants/dates";
import {
  FSReservation,
  ReservationStatus,
  getEffectiveStatus,
} from "@/src/models/reservations.model";
import {
  cancelReservation,
  getReservationById,
} from "@/src/services/reservationService";
import { getCourtById, getVenueById } from "@/src/services/venueService";
import { FSCourt, FSVenue } from "@/src/models/venue.model";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FSMatch } from "@/src/models/match.model";
import { getMatchById } from "@/src/services/matchService";

const STATUS_LABEL: Record<ReservationStatus, string> = {
  upcoming: "UPCOMING",
  ongoing: "ONGOING",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
};

const STATUS_BADGE: Record<ReservationStatus, object> = {
  upcoming: { backgroundColor: "#e8f0fe" },
  ongoing: { backgroundColor: "#fff3cd" },
  completed: { backgroundColor: "#e8eaf6" },
  cancelled: { backgroundColor: "#f5f5f5" },
};

export default function ReservationDetail() {
  const { reservationId } = useLocalSearchParams<{ reservationId: string }>();
  const [reservation, setReservation] = useState<FSReservation | null>(null);
  const [venue, setVenue] = useState<FSVenue | null>(null);
  const [court, setCourt] = useState<FSCourt | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [match, setMatch] = useState<FSMatch | null>(null);

  const load = useCallback(async () => {
    if (!reservationId) return;
    const r = await getReservationById(reservationId);
    if (r?.matchId) {
      const m = await getMatchById(r.matchId);
      setMatch(m);
    }
    if (!r) {
      setLoading(false);
      return;
    }
    setReservation(r);
    const [v, c] = await Promise.all([
      getVenueById(r.venueId),
      getCourtById(r.venueId, r.courtId),
    ]);
    setVenue(v);
    setCourt(c);
  }, [reservationId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onCancel = () => {
    if (!reservation) return;
    Alert.alert(
      "Cancel Reservation",
      `Cancel ${court?.name ?? "court"} on ${formatDate(reservation.date)} at ${reservation.startTime}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelReservation(reservation.id);
              setReservation((prev) =>
                prev ? { ...prev, status: "cancelled" } : prev,
              );
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Reservation not found.</Text>
      </View>
    );
  }

  const effectiveStatus = getEffectiveStatus(reservation);
  const date = new Date(reservation.date);
  const canCancel = effectiveStatus === "upcoming";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Reservation Details</Text>

      {/* Info card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Booking Info</Text>
          <View style={[styles.badge, STATUS_BADGE[effectiveStatus]]}>
            <Text style={styles.badgeText}>
              {STATUS_LABEL[effectiveStatus]}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="home-outline" size={16} color="#555" />
          <Text style={styles.rowText}>{venue?.name ?? "Unknown Venue"}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color="#555" />
          <Text style={styles.rowText}>{venue?.address ?? "—"}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="tennisball-outline" size={16} color="#555" />
          <Text style={styles.rowText}>{court?.name ?? "Unknown Court"}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={16} color="#555" />
          <Text style={styles.rowText}>
            {DAY_NAMES[date.getDay()]}, {MONTH_NAMES[date.getMonth()]}{" "}
            {date.getDate()}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color="#555" />
          <Text style={styles.rowText}>
            {reservation.startTime} – {reservation.endTime}
          </Text>
        </View>

        {reservation.matchId && (
          <View style={[styles.row, { alignItems: "center" }]}>
            <Ionicons name="people-outline" size={16} color="#555" />
            <Text style={styles.rowText}>{match?.matchName}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.gotoBtn,
                pressed && styles.gotoBtnPressed,
              ]}
              onPress={() =>
                router.push(`/match/${reservation.matchId}` as any)
              }
            >
              <Text style={styles.gotoBtnText}>View Match</Text>
            </Pressable>
          </View>
        )}
      </View>

      {canCancel && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          disabled={cancelling}
        >
          {cancelling ? (
            <ActivityIndicator color="#c00" />
          ) : (
            <Text style={styles.cancelBtnText}>Cancel Reservation</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function formatDate(timestamp: number) {
  const d = new Date(timestamp);
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f9" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#999", fontSize: 16 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    marginBottom: 16,
    marginTop: 50,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 12,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111" },
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#333" },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  rowText: { fontSize: 14, color: "#444", flex: 1 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#f00",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelBtnText: { color: "#c00", fontWeight: "700", fontSize: 15 },
  gotoBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gotoBtnPressed: { opacity: 0.7 },
  gotoBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});

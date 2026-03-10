import { UserContext } from "@/src/models/appUserContext";
import {
  FSReservation,
  ReservationStatus,
} from "@/src/models/reservations.model";
import {
  cancelReservation,
  getReservationsByUser,
  markCompletedReservations,
} from "@/src/services/reservationService";
import { getCourtById, getVenueById } from "@/src/services/venueService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type EnrichedReservation = FSReservation & {
  venueName: string;
  courtName: string;
};

const ACCENT = "rgb(111, 161, 226)";
const MONTH_NAMES = [
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
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function getEffectiveStatus(r: FSReservation): ReservationStatus {
  if (r.status === "cancelled") return "cancelled";
  if (r.status === "completed") return "completed";
  const now = new Date();
  const [eh, em] = r.endTime.split(":").map(Number);
  const endDate = new Date(r.date);
  endDate.setHours(eh, em, 0, 0);
  if (endDate < now) return "completed";
  const todayTs = new Date();
  todayTs.setHours(0, 0, 0, 0);
  if (r.date !== todayTs.getTime()) return r.status;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = r.startTime.split(":").map(Number);
  if (nowMins >= sh * 60 + sm) return "ongoing";
  return r.status;
}

const STATUS_LABEL: Record<ReservationStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function Reservations() {
  const user = useContext(UserContext);
  const [reservations, setReservations] = useState<EnrichedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    await markCompletedReservations(user.id);
    const raw = await getReservationsByUser(user.id);

    const statusOrder: Record<ReservationStatus, number> = {
      ongoing: 0,
      upcoming: 1,
      cancelled: 2,
      completed: 3,
    };
    raw.sort((a, b) => {
      const sa = statusOrder[getEffectiveStatus(a)];
      const sb = statusOrder[getEffectiveStatus(b)];
      if (sa !== sb) return sa - sb;
      return a.date - b.date;
    });

    const enriched = await Promise.all(
      raw.map(async (r) => {
        const [venue, court] = await Promise.all([
          getVenueById(r.venueId),
          getCourtById(r.courtId),
        ]);
        return {
          ...r,
          venueName: venue?.name ?? "Unknown Venue",
          courtName: court?.name ?? "Unknown Court",
        };
      }),
    );
    setReservations(enriched);
  }, [user]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onCancel = useCallback((r: EnrichedReservation) => {
    Alert.alert(
      "Cancel Reservation",
      `Cancel ${r.courtName} on ${formatDate(r.date)} at ${r.startTime}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(r.id);
            try {
              await cancelReservation(r.id);
              setReservations((prev) =>
                prev.map((x) =>
                  x.id === r.id ? { ...x, status: "cancelled" } : x,
                ),
              );
            } finally {
              setCancelling(null);
            }
          },
        },
      ],
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }
  if (reservations.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="calendar-outline" size={48} color="#ccc" />
        <Text style={styles.emptyText}>No reservations yet</Text>
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => router.push("/tabs/userinfo/reservations")}
        >
          <Text style={styles.bookBtnText}>Book a Court </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={reservations}
      keyExtractor={(r) => r.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <Text style={styles.screenTitle}>My Reservations</Text>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={ACCENT}
        />
      }
      renderItem={({ item }) => {
        const effectiveStatus = getEffectiveStatus(item);
        const cancelled = effectiveStatus === "cancelled" || effectiveStatus === "completed";
        const badgeStyle =
          effectiveStatus === "ongoing"
            ? styles.badgeOngoing
            : effectiveStatus === "upcoming"
              ? styles.badgeUpcoming
              : effectiveStatus === "completed"
                ? styles.badgeCompleted
                : styles.badgeCancelled;
        return (
          <View style={[styles.card, cancelled && styles.cardCancelled]}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.venueName}>{item.venueName}</Text>
                <Text style={styles.courtName}>{item.courtName}</Text>
              </View>
              <View style={[styles.badge, badgeStyle]}>
                <Text style={styles.badgeText}>
                  {STATUS_LABEL[effectiveStatus]}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.cardFooter}>
              <View>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.infoText}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={14} color="#666" />
                  <Text style={styles.infoText}>
                    {item.startTime} – {item.endTime}
                  </Text>
                </View>
              </View>
              {!cancelled && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  disabled={cancelling === item.id}
                  onPress={() => onCancel(item)}
                >
                  {cancelling === item.id ? (
                    <ActivityIndicator size="small" color="#c00" />
                  ) : (
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f7f7f9",
  },
  emptyText: { fontSize: 16, color: "#aaa", marginTop: 8 },
  bookBtn: {
    marginTop: 4,
    backgroundColor: ACCENT,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  list: { padding: 16, gap: 12, backgroundColor: "#f7f7f9" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardCancelled: { opacity: 0.55 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, marginRight: 10 },
  venueName: { fontSize: 16, fontWeight: "700", color: "#111" },
  courtName: { fontSize: 13, color: "#666", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeOngoing: { backgroundColor: "#e6f4ea" },
  badgeUpcoming: { backgroundColor: "#e8f0fe" },
  badgeCompleted: { backgroundColor: "#ede7f6" },
  badgeCancelled: { backgroundColor: "#f5f5f5" },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#444" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  infoText: { fontSize: 14, color: "#444" },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cancelBtn: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f00",
  },
  cancelBtnText: { color: "#c00", fontWeight: "600", fontSize: 13 },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },
});

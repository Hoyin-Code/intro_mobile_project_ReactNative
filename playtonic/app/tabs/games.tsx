import { FSMatch } from "@/src/models/match.model";
import { FSVenue } from "@/src/models/venue.model";
import { getOpenMatches } from "@/src/services/matchService";
import { getVenues } from "@/src/services/venueService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { match } from "node:assert";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "rgb(111, 161, 226)";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

const SKILL_FILTERS: { label: string; min: number; max: number }[] = [
  { label: "All", min: 0.5, max: 7.0 },
  { label: "1–2", min: 0.5, max: 2.0 },
  { label: "2–3.5", min: 2.0, max: 3.5 },
  { label: "3.5–5", min: 3.5, max: 5.0 },
  { label: "5–7", min: 5.0, max: 7.0 },
];

type EnrichedMatch = FSMatch & { venueName: string; courtName: string };

export default function Games() {
  const router = useRouter();
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterIdx, setFilterIdx] = useState(0);

  const load = useCallback(async () => {
    const [raw, venues] = await Promise.all([getOpenMatches(), getVenues()]);
    const venueMap = new Map<string, FSVenue>(venues.map((v) => [v.id, v]));
    const enriched: EnrichedMatch[] = raw.map((m) => {
      const venue = venueMap.get(m.venueId);
      const court = venue?.courts.find((c) => c.id === m.courtId);
      return {
        ...m,
        venueName: venue?.name ?? "Unknown Venue",
        courtName: court?.name ?? "Unknown Court",
      };
    });
    enriched.sort(
      (a, b) => a.date - b.date || a.startTime.localeCompare(b.startTime),
    );
    setMatches(enriched);
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const activeFilter = SKILL_FILTERS[filterIdx];
  const filtered =
    filterIdx === 0
      ? matches
      : matches.filter(
          (m) =>
            m.minSkillLevel <= activeFilter.max &&
            m.maxSkillLevel >= activeFilter.min,
        );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <FlatList
      data={filtered}
      keyExtractor={(m) => m.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>Find a Match</Text>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push("/create-match/select-venue")}
            >
              <Text style={styles.createBtnText}>Create +</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={SKILL_FILTERS}
            keyExtractor={(_, i) => String(i)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item, index }) => {
              const active = filterIdx === index;
              return (
                <TouchableOpacity
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFilterIdx(index)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="tennisball-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No open matches found</Text>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={ACCENT}
        />
      }
      renderItem={({ item }) => {
        const isFull = item.status === "full";
        const spotsLeft = item.maxPlayers - item.players.length;
        return (
          <Pressable
            style={[styles.card, isFull && styles.cardFull]}
            onPress={() =>
              router.push({
                pathname: "/match/[matchId]",
                params: { matchId: item.id },
              })
            }
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Text style={styles.venueName}>{item.venueName}</Text>
                <Text style={styles.courtName}>{item.courtName}</Text>
              </View>
              <View style={styles.skillBadge}>
                <Text style={styles.skillText}>
                  {item.minSkillLevel}–{item.maxSkillLevel}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
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
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={14} color="#666" />
                <Text style={styles.infoText}>
                  {item.players.length} / {item.maxPlayers} players
                </Text>
              </View>
              {item.description ? (
                <View style={styles.infoRow}>
                  <Ionicons name="chatbubble-outline" size={14} color="#666" />
                  <Text style={styles.infoText} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              ) : null}
            </View>

            <View
              style={[
                styles.spotsBadge,
                isFull ? styles.spotsFull : styles.spotsOpen,
              ]}
            >
              <Text style={styles.spotsText}>
                {isFull
                  ? "Full"
                  : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
              </Text>
            </View>
          </Pressable>
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
    backgroundColor: "#f7f7f9",
  },
  list: {
    padding: 16,
    gap: 12,
    backgroundColor: "#f7f7f9",
    flexGrow: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },
  filterRow: {
    gap: 8,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  filterChipActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  filterChipText: { fontSize: 13, fontWeight: "600", color: "#666" },
  filterChipTextActive: { color: "#fff" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 60,
  },
  emptyText: { fontSize: 15, color: "#aaa" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardFull: { opacity: 0.7 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, marginRight: 10 },
  venueName: { fontSize: 16, fontWeight: "700", color: "#111" },
  courtName: { fontSize: 13, color: "#666", marginTop: 2 },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#e8f0fe",
  },
  skillText: { fontSize: 12, fontWeight: "600", color: "#444" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  cardFooter: { gap: 6 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 14, color: "#444", flex: 1 },
  spotsBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  spotsOpen: { backgroundColor: "#e8f0fe" },
  spotsFull: { backgroundColor: "#f5f5f5" },
  spotsText: { fontSize: 12, fontWeight: "600", color: "#444" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  createBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});

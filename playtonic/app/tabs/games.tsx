import { FSMatch } from "@/src/models/match.model";
import { FSVenue } from "@/src/models/venue.model";
import { getOpenMatches } from "@/src/services/matchService";
import { getVenues } from "@/src/services/venueService";
import EmptyState from "@/src/components/EmptyState";
import MatchCard from "./components/MatchCard";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "rgb(111, 161, 226)";

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
    enriched.sort((a, b) => a.date - b.date || a.startTime.localeCompare(b.startTime));
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
          (m) => m.minSkillLevel <= activeFilter.max && m.maxSkillLevel >= activeFilter.min,
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
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </>
      }
      ListEmptyComponent={
        <EmptyState icon="tennisball-outline" title="No open matches found" />
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
      }
      renderItem={({ item }) => (
        <MatchCard
          match={item}
          onPress={() => router.push({ pathname: "/match/[matchId]", params: { matchId: item.id } })}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f7f7f9" },
  list: { padding: 16, gap: 12, backgroundColor: "#f7f7f9", flexGrow: 1 },
  screenTitle: { fontSize: 22, fontWeight: "800", color: "#111" },
  filterRow: { gap: 8, paddingVertical: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: "#ddd", backgroundColor: "#fff",
  },
  filterChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  filterChipText: { fontSize: 13, fontWeight: "600", color: "#666" },
  filterChipTextActive: { color: "#fff" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  createBtn: { backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  createBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});

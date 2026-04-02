import { FSMatch } from "@/src/models/match.model";
import { FSVenue } from "@/src/models/venue.model";
import { getOpenMatches } from "@/src/services/matchService";
import { getVenues } from "@/src/services/venueService";
import EmptyState from "@/src/components/EmptyState";
import MatchCard from "./components/MatchCard";
import FilterModal, { FilterState } from "./components/FilterModal";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";

const DEFAULT_FILTER: FilterState = {
  dates: new Set(),
  fromHour: 6,
  toHour: 22,
  minSkill: 0.5,
  maxSkill: 7.0,
};

type EnrichedMatch = FSMatch & { venueName: string; courtName: string };

function parseHour(time: string) {
  return parseInt(time.split(":")[0], 10);
}

function isFilterActive(f: FilterState) {
  return (
    f.dates.size > 0 ||
    f.fromHour !== 6 ||
    f.toHour !== 22 ||
    f.minSkill !== 0.5 ||
    f.maxSkill !== 7.0
  );
}

export default function Games() {
  const router = useRouter();
  const [matches, setMatches] = useState<EnrichedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);

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

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = matches.filter((m) => {
    if (filter.dates.size > 0) {
      if (!filter.dates.has(new Date(m.date).toDateString())) return false;
    }
    const hour = parseHour(m.startTime);
    if (hour < filter.fromHour || hour >= filter.toHour) return false;
    if (m.minSkillLevel > filter.maxSkill || m.maxSkillLevel < filter.minSkill) return false;
    return true;
  });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>Find a Match</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
              <Ionicons
                name="filter-circle-outline"
                size={35}
                color={isFilterActive(filter) ? COLORS.accent : "#111"}
              />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="tennisball-outline" title="No open matches found" />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => router.push({ pathname: "/match/[matchId]", params: { matchId: item.id } })}
          />
        )}
      />
      <FilterModal
        visible={filterModalVisible}
        filter={filter}
        onApply={(f) => {
          setFilter(f);
          setFilterModalVisible(false);
        }}
        onClose={() => setFilterModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f7f7f9" },
  list: { padding: 16, gap: 12, backgroundColor: "#f7f7f9", flexGrow: 1 },
  screenTitle: { fontSize: 22, fontWeight: "800", color: "#111" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
});

import { COLORS } from "@/src/constants/colors";
import { MATCH_BADGE } from "@/src/constants/badges";
import { UserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { getMatchesByPlayer } from "@/src/services/matchService";
import { getVenues } from "@/src/services/venueService";
import { getEffectiveMatchStatus } from "@/src/utils/matchUtils";
import { useFocusedData } from "@/src/hooks/useFocusedData";
import { router } from "expo-router";
import { useCallback, useContext } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "@/src/utils/dateUtils";

type EnrichedMatch = FSMatch & { venueName: string };

export default function MyMatches() {
  const user = useContext(UserContext);

  const loader = useCallback(async (): Promise<EnrichedMatch[]> => {
    if (!user) return [];
    const [raw, venues] = await Promise.all([
      getMatchesByPlayer(user.id),
      getVenues(),
    ]);
    const venueMap = new Map(venues.map((v) => [v.id, v]));
    const enriched: EnrichedMatch[] = raw.map((m) => ({
      ...m,
      venueName: venueMap.get(m.venueId)?.name ?? "Unknown Venue",
    }));
    enriched.sort(
      (a, b) => a.date - b.date || a.startTime.localeCompare(b.startTime),
    );
    return enriched;
  }, [user]);

  const { data, loading, refreshing, onRefresh } = useFocusedData(loader);
  const matches = data ?? [];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  if (matches.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>You have no upcoming matches.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={matches}
      keyExtractor={(m) => m.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({ item: m }) => {
        const status = getEffectiveMatchStatus(m);
        const needsResults =
          m.hostId === user?.id &&
          (status === "ongoing" || status === "completed") &&
          !m.results;

        return (
          <Pressable
            style={styles.card}
            onPress={() => {
              if (status === "ongoing" || status === "completed") {
                router.push({ pathname: "/match/[matchId]/results", params: { matchId: m.id } });
              } else {
                router.push({ pathname: "/match/[matchId]", params: { matchId: m.id } });
              }
            }}
          >
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.matchName}>{m.matchName}</Text>
                <Text style={styles.venueName}>{m.venueName}</Text>
              </View>
              <View style={styles.badges}>
                {(status === "ongoing" || status === "completed" || status === "cancelled") && (
                  <View style={[styles.badge, { backgroundColor: MATCH_BADGE[status].color }]}>
                    <Text style={styles.badgeText}>{MATCH_BADGE[status].label}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.infoText}>{formatDate(m.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.infoText}>
                {m.startTime} – {m.endTime}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={14} color="#666" />
              <Text style={styles.infoText}>
                {m.players.length} / {m.maxPlayers} players
              </Text>
            </View>

            {needsResults && (
              <View style={styles.resultsBanner}>
                <Ionicons name="alert-circle-outline" size={16} color="#fff" />
                <Text style={styles.resultsBannerText}>Submit results</Text>
              </View>
            )}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 14, color: "#aaa" },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  matchName: { fontSize: 16, fontWeight: "700", color: "#111" },
  venueName: { fontSize: 13, color: "#666", marginTop: 2 },
  badges: { flexDirection: "row", gap: 6, flexShrink: 0 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "700", color: "#333" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 13, color: "#555" },
  resultsBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    backgroundColor: COLORS.delete,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resultsBannerText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});

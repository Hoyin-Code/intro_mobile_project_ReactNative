import { COLORS } from "@/src/constants/colors";
import { UserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { getMatchesByPlayer } from "@/src/services/matchService";
import { getVenues } from "@/src/services/venueService";
import { useFocusedData } from "@/src/hooks/useFocusedData";
import { useCallback, useContext } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MatchCard from "./components/MatchCard";

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
      renderItem={({ item }) => <MatchCard match={item} userId={user?.id} />}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 14, color: "#aaa" },
  list: { padding: 16, gap: 12 },
});
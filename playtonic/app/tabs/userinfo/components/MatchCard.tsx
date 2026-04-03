import { COLORS } from "@/src/constants/colors";
import { MATCH_BADGE } from "@/src/constants/badges";
import { FSMatch } from "@/src/models/match.model";
import { getEffectiveMatchStatus } from "@/src/utils/matchUtils";
import { formatDate } from "@/src/utils/dateUtils";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  match: FSMatch & { venueName: string };
  userId: string | undefined;
};

export default function MatchCard({ match: m, userId }: Props) {
  const status = getEffectiveMatchStatus(m);
  const needsResults =
    m.hostId === userId &&
    (status === "ongoing" || status === "completed") &&
    !m.results;

  const badge = MATCH_BADGE[status];

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
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={14} color="#666" />
        <Text style={styles.infoText}>{formatDate(m.date)}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={14} color="#666" />
        <Text style={styles.infoText}>{m.startTime} – {m.endTime}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={14} color="#666" />
        <Text style={styles.infoText}>{m.players.length} / {m.maxPlayers} players</Text>
      </View>

      {needsResults && (
        <View style={styles.resultsBanner}>
          <Ionicons name="alert-circle-outline" size={16} color="#fff" />
          <Text style={styles.resultsBannerText}>Submit results</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    gap: 8,
  },
  matchName: { fontSize: 16, fontWeight: "700", color: "#111" },
  venueName: { fontSize: 13, color: "#666", marginTop: 2 },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start" },
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
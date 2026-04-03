import { DAY_NAMES, MONTH_NAMES } from "@/src/constants/dates";
import { MATCH_BADGE } from "@/src/constants/badges";
import { FSMatch } from "@/src/models/match.model";
import { getEffectiveMatchStatus } from "@/src/utils/matchUtils";
import { FSVenue } from "@/src/models/venue.model";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  match: FSMatch;
  venue: FSVenue | null;
};

export default function MatchInfoCard({ match, venue }: Props) {
  const date = new Date(match.date);
  const spotsLeft = match.maxPlayers - match.players.length;
  const status = getEffectiveMatchStatus(match);
  const badge = MATCH_BADGE[status];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Match Info</Text>
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <Ionicons name="home-outline" size={16} color="#555" />
        <Text style={styles.rowText}>{venue?.name}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={16} color="#555" />
        <Text style={styles.rowText}>{venue?.address}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={16} color="#555" />
        <Text style={styles.rowText}>
          {DAY_NAMES[date.getDay()]}, {MONTH_NAMES[date.getMonth()]}{" "}
          {date.getDate()}
          {DAY_NAMES[date.getDay()]}, {MONTH_NAMES[date.getMonth()]}{" "}
          {date.getDate()}
        </Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="time-outline" size={16} color="#555" />
        <Text style={styles.rowText}>
          {match.startTime} – {match.endTime}
        </Text>
        <Text style={styles.rowText}>
          {match.startTime} – {match.endTime}
        </Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="people-outline" size={16} color="#555" />
        <Text style={styles.rowText}>
          {match.players.length} / {match.maxPlayers} players
          {spotsLeft > 0
            ? `  ·  ${spotsLeft} spot${spotsLeft > 1 ? "s" : ""} left`
            : "  ·  Full"}
          {spotsLeft > 0
            ? `  ·  ${spotsLeft} spot${spotsLeft > 1 ? "s" : ""} left`
            : "  ·  Full"}
        </Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="barbell-outline" size={16} color="#555" />
        <Text style={styles.rowText}>
          Skill {match.minSkillLevel} – {match.maxSkillLevel}
        </Text>
        <Text style={styles.rowText}>
          Skill {match.minSkillLevel} – {match.maxSkillLevel}
        </Text>
      </View>

      {match.description && (
        <View style={styles.row}>
          <Ionicons name="document-text-outline" size={16} color="#555" />
          <Text style={styles.rowText}>{match.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 12,
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
});

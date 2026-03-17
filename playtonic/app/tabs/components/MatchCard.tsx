import { FSMatch } from "@/src/models/match.model";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type EnrichedMatch = FSMatch & { venueName: string };

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

type Props = {
  match: EnrichedMatch;
  onPress: () => void;
};

export default function MatchCard({ match, onPress }: Props) {
  const isFull = match.status === "full";
  const spotsLeft = match.maxPlayers - match.players.length;

  return (
    <Pressable style={[styles.card, isFull && styles.cardFull]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.matchName}>{match.matchName}</Text>
          <Text style={styles.venueName}>{match.venueName}</Text>
        </View>
        <View style={styles.skillBadge}>
          <Text style={styles.skillText}>{match.minSkillLevel}–{match.maxSkillLevel}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.infoText}>{formatDate(match.date)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.infoText}>{match.startTime} – {match.endTime}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.infoText}>{match.players.length} / {match.maxPlayers} players</Text>
        </View>
        {match.description ? (
          <View style={styles.infoRow}>
            <Ionicons name="chatbubble-outline" size={14} color="#666" />
            <Text style={styles.infoText} numberOfLines={2}>{match.description}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.spotsBadge, isFull ? styles.spotsFull : styles.spotsOpen]}>
        <Text style={styles.spotsText}>
          {isFull ? "Full" : `${spotsLeft} spot${spotsLeft === 1 ? "" : "s"} left`}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#eee" },
  cardFull: { opacity: 0.7 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerLeft: { flex: 1, marginRight: 10 },
  matchName: { fontSize: 16, fontWeight: "700", color: "#111" },
  venueName: { fontSize: 13, color: "#666", marginTop: 2 },
  skillBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: "#e8f0fe" },
  skillText: { fontSize: 12, fontWeight: "600", color: "#444" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee", marginVertical: 12 },
  cardFooter: { gap: 6 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 14, color: "#444", flex: 1 },
  spotsBadge: { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  spotsOpen: { backgroundColor: "#e8f0fe" },
  spotsFull: { backgroundColor: "#f5f5f5" },
  spotsText: { fontSize: 12, fontWeight: "600", color: "#444" },
});

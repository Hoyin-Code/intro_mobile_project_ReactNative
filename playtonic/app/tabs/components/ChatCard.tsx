import { COLORS } from "@/src/constants/colors";
import { MONTH_NAMES } from "@/src/constants/dates";
import { FSMatch } from "@/src/models/match.model";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  match: FSMatch;
  onPress: () => void;
};

export default function ChatCard({ match, onPress }: Props) {
  const date = new Date(match.date);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubbles-outline" size={24} color={COLORS.accent} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.matchName}>{match.matchName}</Text>
        <Text style={styles.matchSub}>
          {MONTH_NAMES[date.getMonth()]} {date.getDate()} · {match.startTime} – {match.endTime}
        </Text>
        <Text style={styles.matchSub}>{match.players.length}/{match.maxPlayers} players</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#eef3fb", justifyContent: "center", alignItems: "center",
  },
  cardContent: { flex: 1, gap: 2 },
  matchName: { fontSize: 15, fontWeight: "700", color: "#111" },
  matchSub: { fontSize: 13, color: "#777" },
});

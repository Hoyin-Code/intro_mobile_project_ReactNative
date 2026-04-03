import { COLORS } from "@/src/constants/colors";
import { AppUserContext } from "@/src/models/appUserContext";
import Avatar from "@/src/components/Avatar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  players: AppUserContext[];
  spotsLeft: number;
  hostId: string;
  onResultsPress?: () => void;
};

export default function PlayersCard({
  players,
  spotsLeft,
  hostId,
  onResultsPress,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Players</Text>

      {players.map((p, i) => (
        <View
          key={p.id}
          style={[
            styles.playerRow,
            i < players.length - 1 && styles.playerDivider,
          ]}
        >
          <Avatar uri={p.imageUrl} name={p.displayName} size={44} />
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>
              {p.displayName}
              {p.id === hostId ? (
                <Text style={styles.hostTag}> · Host</Text>
              ) : null}
            </Text>
            <Text style={styles.playerSub}>Skill {p.skillLevel}</Text>
          </View>
        </View>
      ))}

      {Array.from({ length: spotsLeft }).map((_, i) => (
        <View
          key={`empty-${i}`}
          style={[styles.playerRow, styles.playerDivider]}
        >
          <Avatar size={44} empty />
          <Text style={styles.emptySlot}>Open slot</Text>
        </View>
      ))}

      {onResultsPress && (
        <TouchableOpacity style={styles.resultsBtn} onPress={onResultsPress}>
          <Text style={styles.resultsBtnText}>View Results</Text>
        </TouchableOpacity>
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
    gap: 7,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  playerDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 15, fontWeight: "600", color: "#111" },
  hostTag: { fontWeight: "400", color: COLORS.accent },
  playerSub: { fontSize: 12, color: "#888", marginTop: 1 },
  emptySlot: { fontSize: 14, color: "#bbb", fontStyle: "italic" },
  resultsBtn: {
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    paddingTop: 12,
    alignItems: "center",
  },
  resultsBtnText: { fontSize: 14, fontWeight: "600", color: "#666" },
});

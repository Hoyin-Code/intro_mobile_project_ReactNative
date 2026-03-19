import { AppUserContext } from "@/src/models/appUserContext";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACCENT = "rgb(111, 161, 226)";

type Props = {
  players: AppUserContext[];
  spotsLeft: number;
  hostId: string;
  onResultsPress?: () => void;
};

export default function PlayersCard({ players, spotsLeft, hostId, onResultsPress }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Players</Text>

      {players.map((p, i) => (
        <View
          key={p.id}
          style={[styles.playerRow, i < players.length - 1 && styles.playerDivider]}
        >
          {p.imageUrl ? (
            <Image source={{ uri: p.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{p.displayName?.[0]?.toUpperCase() ?? "?"}</Text>
            </View>
          )}
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>
              {p.displayName}
              {p.id === hostId ? <Text style={styles.hostTag}> · Host</Text> : null}
            </Text>
            <Text style={styles.playerSub}>Skill {p.skillLevel}</Text>
          </View>
        </View>
      ))}

      {Array.from({ length: spotsLeft }).map((_, i) => (
        <View key={`empty-${i}`} style={[styles.playerRow, styles.playerDivider]}>
          <View style={[styles.avatarPlaceholder, styles.avatarEmpty]}>
            <Ionicons name="person-add-outline" size={18} color="#ccc" />
          </View>
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
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 4 },
  playerRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 4 },
  playerDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#eee" },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#e8e8e8", justifyContent: "center", alignItems: "center",
  },
  avatarEmpty: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  avatarInitial: { fontSize: 18, fontWeight: "700", color: "#666" },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 15, fontWeight: "600", color: "#111" },
  hostTag: { fontWeight: "400", color: ACCENT },
  playerSub: { fontSize: 12, color: "#888", marginTop: 1 },
  emptySlot: { fontSize: 14, color: "#bbb", fontStyle: "italic" },
  resultsBtn: { marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#eee", paddingTop: 12, alignItems: "center" },
  resultsBtnText: { fontSize: 14, fontWeight: "600", color: "#666" },
});

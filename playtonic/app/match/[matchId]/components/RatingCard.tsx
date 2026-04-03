import Avatar from "@/src/components/Avatar";
import { AppUserContext } from "@/src/models/appUserContext";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  players: AppUserContext[];
  deltas: Record<string, number>;
};

export default function RatingCard({ players, deltas }: Props) {
  if (Object.keys(deltas).length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Skill Rating</Text>
      {players
        .filter((p) => deltas[p.id] !== undefined)
        .map((p) => {
          const delta = deltas[p.id];
          const gain = delta >= 0;
          return (
            <View key={p.id} style={styles.ratingRow}>
              <Avatar uri={p.imageUrl} name={p.displayName} size={32} />
              <Text style={styles.ratingName} numberOfLines={1}>{p.displayName}</Text>
              <Text style={styles.ratingBase}>{p.skillLevel.toFixed(1)}</Text>
              <Text style={[styles.ratingDelta, { color: gain ? "#34a853" : "#e03e3e" }]}>
                {gain ? "+" : ""}{delta.toFixed(2)}
              </Text>
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 12 },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#f0f0f0",
    paddingVertical: 10,
  },
  ratingName: { flex: 1, fontSize: 14, color: "#222" },
  ratingBase: { fontSize: 14, color: "#aaa", fontWeight: "600" },
  ratingDelta: { fontSize: 15, fontWeight: "700", minWidth: 48, textAlign: "right" },
});

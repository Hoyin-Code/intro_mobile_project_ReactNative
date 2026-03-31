import { COLORS } from "@/src/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type Game = { a: string; b: string };

type Props = {
  games: Game[];
  canSubmit: boolean;
  onUpdateGame: (i: number, side: "a" | "b", val: string) => void;
  onAddGame: () => void;
  onRemoveGame: (i: number) => void;
};

export default function ScoreCard({ games, canSubmit, onUpdateGame, onAddGame, onRemoveGame }: Props) {
  const teamAScore = games.reduce((s, g) => s + (parseInt(g.a) || 0), 0);
  const teamBScore = games.reduce((s, g) => s + (parseInt(g.b) || 0), 0);

  return (
    <View style={styles.card}>
      <View style={styles.scoreHeader}>
        <Text style={styles.cardTitle}>Score</Text>
        {canSubmit && (
          <TouchableOpacity onPress={onAddGame} style={styles.addGameBtn}>
            <Ionicons name="add" size={18} color={COLORS.accent} />
            <Text style={styles.addGameLabel}>Add game</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.scoreRow}>
        <Text style={[styles.scoreTeamHeader, { color: "#4e8ef7" }]}>Team A</Text>
        <View style={{ width: 40 }} />
        <Text style={[styles.scoreTeamHeader, { color: "#e07b54" }]}>Team B</Text>
        {canSubmit && <View style={{ width: 28 }} />}
      </View>

      {games.map((g, i) => (
        <View key={i} style={styles.scoreRow}>
          {canSubmit ? (
            <TextInput
              style={[styles.scoreInput, { borderColor: "#4e8ef7" }]}
              value={g.a}
              onChangeText={(v) => onUpdateGame(i, "a", v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="0"
              placeholderTextColor="#ccc"
            />
          ) : (
            <Text style={[styles.scoreReadonly, { color: "#4e8ef7" }]}>{g.a || "0"}</Text>
          )}
          <Text style={styles.gameLabel}>G{i + 1}</Text>
          {canSubmit ? (
            <TextInput
              style={[styles.scoreInput, { borderColor: "#e07b54" }]}
              value={g.b}
              onChangeText={(v) => onUpdateGame(i, "b", v.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="0"
              placeholderTextColor="#ccc"
            />
          ) : (
            <Text style={[styles.scoreReadonly, { color: "#e07b54" }]}>{g.b || "0"}</Text>
          )}
          {canSubmit && (
            <TouchableOpacity onPress={() => onRemoveGame(i)} style={{ width: 28, alignItems: "center" }}>
              {games.length > 1 && <Ionicons name="remove-circle-outline" size={20} color="#ccc" />}
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={[styles.scoreRow, styles.totalRow]}>
        <Text style={[styles.totalScore, { color: "#4e8ef7" }]}>{teamAScore}</Text>
        <Text style={styles.gameLabel}>Total</Text>
        <Text style={[styles.totalScore, { color: "#e07b54" }]}>{teamBScore}</Text>
        {canSubmit && <View style={{ width: 28 }} />}
      </View>
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
  scoreHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  addGameBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addGameLabel: { fontSize: 13, color: COLORS.accent, fontWeight: "600" },
  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 6 },
  scoreTeamHeader: { flex: 1, textAlign: "center", fontSize: 13, fontWeight: "700" },
  gameLabel: { width: 40, textAlign: "center", fontSize: 12, color: "#aaa", fontWeight: "600" },
  scoreInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  scoreReadonly: {
    flex: 1,
    height: 48,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  totalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#eee",
    paddingTop: 8,
    marginTop: 2,
    marginBottom: 0,
  },
  totalScore: { flex: 1, textAlign: "center", fontSize: 24, fontWeight: "800" },
});

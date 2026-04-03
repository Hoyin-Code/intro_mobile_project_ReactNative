import { COLORS } from "@/src/constants/colors";
import { useMatchResults } from "@/src/hooks/useMatchResults";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import RatingCard from "./components/RatingCard";
import ScoreCard from "./components/ScoreCard";
import TeamsCard from "./components/TeamsCard";

export default function MatchResults() {
  const {
    players,
    assignments,
    games,
    deltas,
    canSubmit,
    assign,
    updateGame,
    addGame,
    removeGame,
    submit,
  } = useMatchResults();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Match Results</Text>

        <TeamsCard
          players={players}
          assignments={assignments}
          canSubmit={canSubmit}
          onAssign={assign}
        />

        <ScoreCard
          games={games}
          canSubmit={canSubmit}
          onUpdateGame={updateGame}
          onAddGame={addGame}
          onRemoveGame={removeGame}
        />

        <RatingCard players={players} deltas={deltas} />

        {canSubmit && (
          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.8}
            onPress={submit}
          >
            <Text style={styles.submitLabel}>Submit Results</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f9" },
  content: { padding: 16, paddingBottom: 48 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    marginTop: 50,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

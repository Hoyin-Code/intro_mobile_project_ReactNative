import { COLORS } from "@/src/constants/colors";
import { AppUserContext, UserContext } from "@/src/models/appUserContext";
import { FSMatch, Results } from "@/src/models/match.model";
import { getMatchById, submitResults } from "@/src/services/matchService";
import { computeRatingDeltas } from "@/src/services/ratingService";
import { getUserById } from "@/src/services/userService";
import { isMatchOngoing } from "@/src/utils/matchUtils";
import { useLocalSearchParams } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RatingCard from "../components/RatingCard";
import ScoreCard from "../components/ScoreCard";
import TeamsCard from "../components/TeamsCard";
import { hasUncaughtExceptionCaptureCallback } from "node:process";
import { registerEventHandler } from "react-native-reanimated/lib/typescript/core";

type TeamSlot = "A" | "B" | null;

export default function MatchResults() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const user = useContext(UserContext);
  const [match, setMatch] = useState<FSMatch | null>(null);
  const [players, setPlayers] = useState<AppUserContext[]>([]);
  const [assignments, setAssignments] = useState<Record<string, TeamSlot>>({});
  const [games, setGames] = useState([{ a: "", b: "" }]);

  const loadMatch = async () => {
    const m = await getMatchById(matchId);
    setMatch(m);
    if (!m) return;
    const fetched = await Promise.all(m.players.map((id) => getUserById(id)));
    setPlayers(fetched.filter(Boolean) as AppUserContext[]);
    if (m.results) {
      const a: Record<string, TeamSlot> = {};
      m.results.team1.forEach((p) => {
        a[p.id] = "A";
      });
      m.results.team2.forEach((p) => {
        a[p.id] = "B";
      });
      setAssignments(a);
      setGames(
        m.results.games.map((g) => ({
          a: String(g.team1),
          b: String(g.team2),
        })),
      );
    }
  };

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const isHost = !!user && !!match && user.id === match.hostId;
  const canSubmit = isHost && !match?.results;

  const assign = (userId: string, team: TeamSlot) => {
    setAssignments((prev) => {
      if (team !== null) {
        const count = Object.values(prev).filter((t) => t === team).length;
        if (count >= 2 && prev[userId] !== team) return prev;
      }
      return { ...prev, [userId]: prev[userId] === team ? null : team };
    });
  };

  const teamPlayers = (team: "A" | "B") =>
    players.filter((p) => assignments[p.id] === team);

  const updateGame = (i: number, side: "a" | "b", val: string) =>
    setGames((prev) =>
      prev.map((g, idx) => (idx === i ? { ...g, [side]: val } : g)),
    );

  const addGame = () => setGames((prev) => [...prev, { a: "", b: "" }]);
  const removeGame = (i: number) =>
    setGames((prev) =>
      prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev,
    );

  const teamAScore = games.reduce((s, g) => s + (parseInt(g.a) || 0), 0);
  const teamBScore = games.reduce((s, g) => s + (parseInt(g.b) || 0), 0);

  const deltas = match?.results
    ? match.results.ratingDeltas
    : computeRatingDeltas(
        teamPlayers("A"),
        teamPlayers("B"),
        teamAScore,
        teamBScore,
      );

  const winner =
    teamAScore > teamBScore
      ? "team1"
      : teamAScore < teamBScore
        ? "team2"
        : "draw";

  const payload: Results = {
    team1: teamPlayers("A"),
    team2: teamPlayers("B"),
    games: games.map((g) => ({
      team1: parseInt(g.a) || 0,
      team2: parseInt(g.b) || 0,
      winner:
        (parseInt(g.a) || 0) > (parseInt(g.b) || 0)
          ? "team1"
          : (parseInt(g.a) || 0) < (parseInt(g.b) || 0)
            ? "team2"
            : "draw",
    })),
    winner,
    ratingDeltas: deltas,
    submittedAt: Date.now(),
  };
  async function submit(match: FSMatch, results: Results) {
    // TODO: fix validations when teams are empty and score is 0
    if (results.team1.length > 2 || results.team2.length > 2)
      return alert("Assign players to both teams before submitting.");
    if (results.games.length === 0)
      return alert("Add at least one game score before submitting.");
    try {
      await submitResults(match, results);
      await loadMatch();
    } catch {
      return alert("Could not submit results, try again later.");
    }
  }
  const canView =
    !!match && (isMatchOngoing(match) || match.status === "completed");

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
            onPress={() => match && submit(match, payload)}
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
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitLabel: { color: "#fff", fontSize: 16, fontWeight: "700" },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  lockedBox: { alignItems: "center", gap: 8 },
  lockedIcon: { fontSize: 36 },
  lockedTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  lockedSub: { fontSize: 14, color: "#666" },
});

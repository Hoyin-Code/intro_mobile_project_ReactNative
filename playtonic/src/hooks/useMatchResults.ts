import { AppUserContext, UserContext } from "@/src/models/appUserContext";
import { FSMatch, ResultPlayer, Results } from "@/src/models/match.model";
import { getMatchById, submitResults } from "@/src/services/matchService";
import { computeRatingDeltas, updateRatings } from "@/src/services/ratingService";
import { getUserById } from "@/src/services/userService";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useContext, useState } from "react";

type TeamSlot = "A" | "B" | null;
type GameEntry = { a: string; b: string };

function sanitize(p: AppUserContext): ResultPlayer {
  return {
    id: p.id,
    displayName: p.displayName,
    imageUrl: p.imageUrl ?? null,
    skillLevel: p.skillLevel,
  };
}

function isValidGameScore(a: number, b: number) {
  if (a === b) return false;
  const max = Math.max(a, b);
  if (max < 6) return false;
  if (max === 6) return true;
  return Math.abs(a - b) >= 2;
}

export function useMatchResults() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const user = useContext(UserContext);

  const [match, setMatch] = useState<FSMatch | null>(null);
  const [players, setPlayers] = useState<ResultPlayer[]>([]);
  const [assignments, setAssignments] = useState<Record<string, TeamSlot>>({});
  const [games, setGames] = useState<GameEntry[]>([{ a: "", b: "" }]);

  const loadMatch = useCallback(async () => {
    const m = await getMatchById(matchId);
    setMatch(m);
    if (!m) return;
    const fetched = await Promise.all(m.players.map((id) => getUserById(id)));
    setPlayers((fetched.filter(Boolean) as AppUserContext[]).map(sanitize));
    if (m.results) {
      const a: Record<string, TeamSlot> = {};
      m.results.team1.forEach((p) => { a[p.id] = "A"; });
      m.results.team2.forEach((p) => { a[p.id] = "B"; });
      setAssignments(a);
      setGames(m.results.games.map((g) => ({ a: String(g.team1), b: String(g.team2) })));
    }
  }, [matchId]);

  useFocusEffect(useCallback(() => { loadMatch(); }, [loadMatch]));

  const assign = (userId: string, team: TeamSlot) => {
    setAssignments((prev) => {
      if (team !== null) {
        const count = Object.values(prev).filter((t) => t === team).length;
        if (count >= 2 && prev[userId] !== team) return prev;
      }
      return { ...prev, [userId]: prev[userId] === team ? null : team };
    });
  };

  const teamPlayers = (team: "A" | "B") => players.filter((p) => assignments[p.id] === team);

  const updateGame = (i: number, side: "a" | "b", val: string) =>
    setGames((prev) => prev.map((g, idx) => (idx === i ? { ...g, [side]: val } : g)));

  const addGame = () => setGames((prev) => [...prev, { a: "", b: "" }]);

  const removeGame = (i: number) =>
    setGames((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const teamAScore = games.reduce((s, g) => s + (parseInt(g.a) || 0), 0);
  const teamBScore = games.reduce((s, g) => s + (parseInt(g.b) || 0), 0);

  const winner: "team1" | "team2" | "draw" =
    teamAScore > teamBScore ? "team1" : teamAScore < teamBScore ? "team2" : "draw";

  const deltas = match?.results
    ? match.results.ratingDeltas
    : computeRatingDeltas(teamPlayers("A"), teamPlayers("B"), teamAScore, teamBScore);

  const buildPayload = (): Results => ({
    team1: teamPlayers("A"),
    team2: teamPlayers("B"),
    games: games.map((g) => {
      const a = parseInt(g.a) || 0;
      const b = parseInt(g.b) || 0;
      return { team1: a, team2: b, winner: a > b ? "team1" : a < b ? "team2" : "draw" };
    }),
    winner,
    ratingDeltas: deltas,
    submittedAt: Date.now(),
  });

  const submit = async () => {
    if (!match) return;
    const results = buildPayload();
    if (results.team1.length < 2 || results.team2.length < 2)
      return alert("Assign players to both teams before submitting.");
    if (results.games.length === 0)
      return alert("Add at least one game score before submitting.");
    const invalidGame = results.games.find((g) => !isValidGameScore(g.team1, g.team2));
    if (invalidGame)
      return alert(
        `Invalid score ${invalidGame.team1}–${invalidGame.team2}. ` +
          "First to 6 wins; if above 6 a 2-point lead is required.",
      );
    try {
      await submitResults(match, results);
      await updateRatings(results.team1, results.team2, results.winner);
      await loadMatch();
    } catch (e) {
      console.error("submitResults error:", e);
      alert("Could not submit results, try again later.");
    }
  };

  const isHost = !!user && !!match && user.id === match.hostId;
  const canSubmit = isHost && !match?.results;

  return {
    match,
    players,
    assignments,
    games,
    deltas,
    canSubmit,
    assign,
    teamPlayers,
    updateGame,
    addGame,
    removeGame,
    submit,
  };
}

export type { TeamSlot };

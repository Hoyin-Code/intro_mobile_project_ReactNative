import { AppUserContext, UserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { FSVenue } from "@/src/models/venue.model";
import { getMatchById, joinMatch } from "@/src/services/matchService";
import { getUserById } from "@/src/services/userService";
import { getVenueById } from "@/src/services/venueService";
import { router, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";

import MatchActionButton from "../components/MatchActionButton";
import MatchInfoCard from "../components/MatchInfoCard";
import PlayersCard from "../components/PlayersCard";

import { COLORS } from "@/src/constants/colors";

export default function MatchOverview() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const user = useContext(UserContext);
  const [match, setMatch] = useState<FSMatch | null>(null);
  const [players, setPlayers] = useState<AppUserContext[]>([]);
  const [venue, setVenue] = useState<FSVenue | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const loadMatch = async () => {
    if (!matchId) return;
    setLoading(true);
    const m = await getMatchById(matchId);
    if (!m) { setLoading(false); return; }
    setMatch(m);
    const [v, results] = await Promise.all([
      getVenueById(m.venueId),
      Promise.all(m.players.map(getUserById)),
    ]);
    setVenue(v);
    setPlayers(results.filter(Boolean) as AppUserContext[]);
    setLoading(false);
  };

  useEffect(() => { loadMatch(); }, [matchId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Match not found.</Text>
      </View>
    );
  }

  const spotsLeft = match.maxPlayers - match.players.length;

  return (
    <View style={styles.container}>
      <Text style={styles.matchName}>{match.matchName}</Text>
      <MatchInfoCard match={match} venue={venue} />
      <PlayersCard
        players={players}
        spotsLeft={spotsLeft}
        hostId={match.hostId}
        onResultsPress={() => router.push({ pathname: "/match/[matchId]/results", params: { matchId: match.id } })}
      />
      <MatchActionButton
        match={match}
        user={user}
        joining={joining}
        onJoin={async () => {
          if (!user) return;
          setJoining(true);
          try {
            await joinMatch(match.id, user.id);
            await loadMatch();
          } catch {
            Alert.alert("Error", "Could not join match. Please try again.");
          } finally {
            setJoining(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f9", padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#999", fontSize: 16 },
  matchName: { fontSize: 24, fontWeight: "800", color: "#111", marginBottom: 16, marginTop: 50 },

});

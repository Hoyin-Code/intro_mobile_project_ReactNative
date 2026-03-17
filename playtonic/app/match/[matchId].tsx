import { AppUserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { getMatchById } from "@/src/services/matchService";
import { getUserById } from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "rgb(111, 161, 226)";
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MatchOverview() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [match, setMatch] = useState<FSMatch | null>(null);
  const [players, setPlayers] = useState<AppUserContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    (async () => {
      const m = await getMatchById(matchId);
      if (!m) {
        setLoading(false);
        return;
      }
      setMatch(m);
      const results = await Promise.all(m.players.map(getUserById));
      setPlayers(results.filter(Boolean) as AppUserContext[]);
      setLoading(false);
    })();
  }, [matchId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ACCENT} size="large" />
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

  const date = new Date(match.date);
  const spotsLeft = match.maxPlayers - match.players.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title */}
      <Text style={styles.matchName}>{match.matchName}</Text>

      {/* Status badge */}
      <View
        style={[
          styles.badge,
          match.status === "open" ? styles.badgeOpen : styles.badgeFull,
        ]}
      >
        <Text style={styles.badgeText}>{match.status.toUpperCase()}</Text>
      </View>

      {/* Match info card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Match Info</Text>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={16} color="#555" />
          <Text style={styles.rowText}>
            {DAY_NAMES[date.getDay()]}, {MONTH_NAMES[date.getMonth()]}{" "}
            {date.getDate()}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color="#555" />
          <Text style={styles.rowText}>
            {match.startTime} – {match.endTime}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="people-outline" size={16} color="#555" />
          <Text style={styles.rowText}>
            {match.players.length} / {match.maxPlayers} players
            {spotsLeft > 0
              ? `  ·  ${spotsLeft} spot${spotsLeft > 1 ? "s" : ""} left`
              : "  ·  Full"}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="barbell-outline" size={16} color="#555" />
          <Text style={styles.rowText}>
            Skill {match.minSkillLevel} – {match.maxSkillLevel}
          </Text>
        </View>

        {match.description && (
          <View style={styles.row}>
            <Ionicons name="document-text-outline" size={16} color="#555" />
            <Text style={styles.rowText}>{match.description}</Text>
          </View>
        )}
      </View>

      {/* Players card */}
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
            {p.imageUrl ? (
              <Image source={{ uri: p.imageUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {p.displayName?.[0]?.toUpperCase() ?? "?"}
                </Text>
              </View>
            )}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {p.displayName}
                {p.id === match.hostId ? (
                  <Text style={styles.hostTag}> · Host</Text>
                ) : null}
              </Text>
              <Text style={styles.playerSub}>Skill {p.skilllevel}</Text>
            </View>
          </View>
        ))}

        {/* Empty slots */}
        {Array.from({ length: spotsLeft }).map((_, i) => (
          <View
            key={`empty-${i}`}
            style={[styles.playerRow, styles.playerDivider]}
          >
            <View style={[styles.avatarPlaceholder, styles.avatarEmpty]}>
              <Ionicons name="person-add-outline" size={18} color="#ccc" />
            </View>
            <Text style={styles.emptySlot}>Open slot</Text>
          </View>
        ))}
      </View>

      {/* Chat button */}
      <TouchableOpacity
        style={styles.chatBtn}
        onPress={() =>
          router.push({
            pathname: "/chat/[matchId]",
            params: { matchId: match.id, matchName: match.matchName },
          })
        }
      >
        <Ionicons name="chatbubble-outline" size={18} color="#fff" />
        <Text style={styles.chatBtnText}>Open Chat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f9" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#999", fontSize: 16 },
  matchName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 20,
    marginTop: 100,
  },
  badgeOpen: { backgroundColor: "#e6f4ea" },
  badgeFull: { backgroundColor: "#fdecea" },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#333" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  rowText: { fontSize: 14, color: "#444", flex: 1 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  playerDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eee",
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8e8e8",
    justifyContent: "center",
    alignItems: "center",
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
  chatBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  chatBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

import { formatDate } from "@/src/utils/dateUtils";
import { FSMatch } from "@/src/models/match.model";
import { getUserById } from "@/src/services/userService";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type EnrichedMatch = FSMatch & { venueName: string };

type PlayerInfo = { id: string; imageUrl: string | null; displayName: string };

type Props = {
  match: EnrichedMatch;
  onPress: () => void;
};

export default function MatchCard({ match, onPress }: Props) {
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(match.players.map((id) => getUserById(id))).then((results) => {
      if (cancelled) return;
      setPlayers(
        results.map((u, i) => ({
          id: match.players[i],
          imageUrl: u?.imageUrl ?? null,
          displayName: u?.displayName ?? "?",
        })),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [match.players]);

  return (
    <Pressable style={[styles.card]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.matchName}>{match.matchName}</Text>
          <Text style={styles.venueName}>{match.venueName}</Text>
        </View>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              match.competitive
                ? styles.badgeCompetitive
                : styles.badgeFriendly,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                match.competitive
                  ? styles.badgeTextCompetitive
                  : styles.badgeTextFriendly,
              ]}
            >
              {match.competitive ? "Competitive" : "Friendly"}
            </Text>
          </View>
          {match.mixedTeams && (
            <View style={styles.mixedBadge}>
              <Text style={styles.mixedText}>Mixed</Text>
            </View>
          )}
          {match.competitive && (
            <View style={styles.skillBadge}>
              <Text style={styles.skillText}>
                {match.minSkillLevel}–{match.maxSkillLevel}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.infoText}>{formatDate(match.date)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.infoText}>
              {match.startTime} – {match.endTime}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="people-outline" size={14} color="#666" />
            <Text style={styles.infoText}>
              {match.players.length} / {match.maxPlayers} players
            </Text>
          </View>
          {match.description ? (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble-outline" size={14} color="#666" />
              <Text style={styles.infoText} numberOfLines={2}>
                {match.description}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.avatarStack}>
          {Array.from({ length: match.maxPlayers }).map((_, i) => {
            const player = players[i];
            return (
              <View key={i} style={styles.avatarWrapper}>
                {player?.imageUrl ? (
                  <Image
                    source={{ uri: player.imageUrl }}
                    style={styles.avatar}
                  />
                ) : player ? (
                  <View style={[styles.avatar, styles.avatarFallback]}>
                    <Text style={styles.avatarInitial}>
                      {player.displayName[0]?.toUpperCase()}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.avatar, styles.avatarEmpty]}>
                    <Ionicons
                      name="person-add-outline"
                      size={14}
                      color="#ccc"
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardFull: { opacity: 0.7 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1, marginRight: 10 },
  matchName: { fontSize: 16, fontWeight: "700", color: "#111" },
  venueName: { fontSize: 13, color: "#666", marginTop: 2 },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#e8f0fe",
  },

  skillText: { fontSize: 12, fontWeight: "600", color: "#444" },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  mixedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "#a1e6dc",
  },
  mixedText: { fontSize: 12, fontWeight: "600", color: "#2e776c" },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: { flex: 1, gap: 6 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoText: { fontSize: 14, color: "#444", flex: 1 },
  avatarStack: {
    gap: 6,
    alignItems: "center",
    paddingLeft: 8,
    width: 150,
    height: 100,
    justifyContent: "center",
    display: "contents",
    flexDirection: "row",
  },

  avatarWrapper: { marginLeft: 3 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#eee",
  },
  avatarFallback: {
    backgroundColor: "#dde8f7",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmpty: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 14, fontWeight: "700", color: "#555" },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 6,
    width: "51%",
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeCompetitive: { backgroundColor: "#fde8e8" },
  badgeFriendly: { backgroundColor: "#e8f5e9" },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextCompetitive: { color: "#c0392b" },
  badgeTextFriendly: { color: "#27ae60" },
  spotsBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  spotsOpen: { backgroundColor: "#e8f0fe" },
  spotsFull: { backgroundColor: "#f5f5f5" },
  spotsText: { fontSize: 12, fontWeight: "600", color: "#444" },
});

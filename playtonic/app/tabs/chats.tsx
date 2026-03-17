import { UserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { getMatchesByPlayer } from "@/src/services/matchService";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
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

export default function Chatlist() {
  const user = useContext(UserContext);
  const [matches, setMatches] = useState<FSMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await getMatchesByPlayer(user.id);
      result.sort((a, b) => a.date - b.date);
      setMatches(result);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const renderItem = ({ item }: { item: FSMatch }) => {
    const date = new Date(item.date);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: "/chat/[matchId]",
            params: { matchId: item.id, matchName: item.matchName },
          })
        }
      >
        <View style={styles.iconContainer}>
          <Ionicons name="chatbubbles-outline" size={24} color={ACCENT} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.matchName}>{item.matchName}</Text>
          <Text style={styles.matchSub}>
            {MONTH_NAMES[date.getMonth()]} {date.getDate()} · {item.startTime}{" "}
            – {item.endTime}
          </Text>
          <Text style={styles.matchSub}>
            {item.players.length}/{item.maxPlayers} players
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#ccc" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Chats</Text>
      <FlatList
        data={matches}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} colors={[ACCENT]} tintColor={ACCENT} />
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>You're not in any matches yet.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f9" },
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eef3fb",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: { flex: 1, gap: 2 },
  matchName: { fontSize: 15, fontWeight: "700", color: "#111" },
  matchSub: { fontSize: 13, color: "#777" },
  empty: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 60,
    fontStyle: "italic",
  },
});

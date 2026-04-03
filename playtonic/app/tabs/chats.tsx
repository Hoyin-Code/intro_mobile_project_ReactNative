import { UserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { getMatchesByPlayer } from "@/src/services/matchService";
import { useFocusedData } from "@/src/hooks/useFocusedData";
import { router } from "expo-router";
import React, { useCallback, useContext } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import ChatCard from "./components/ChatCard";

import { COLORS } from "@/src/constants/colors";

export default function Chatlist() {
  const user = useContext(UserContext);

  const loader = useCallback(async (): Promise<FSMatch[]> => {
    if (!user) return [];
    const result = await getMatchesByPlayer(user.id);
    result.sort((a, b) => a.date - b.date);
    return result;
  }, [user]);

  const { data, loading, refreshing, onRefresh } = useFocusedData(loader);
  const matches = data ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Chats</Text>
      <FlatList
        data={matches}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => (
          <ChatCard
            match={item}
            onPress={() =>
              router.push({
                pathname: "/chat/[matchId]",
                params: { matchId: item.id, matchName: item.matchName },
              })
            }
          />
        )}
        ListEmptyComponent={
          !loading && !refreshing ? (
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
  empty: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 60,
    fontStyle: "italic",
  },
});

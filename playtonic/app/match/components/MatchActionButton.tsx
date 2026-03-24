import { AppUserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";

import { COLORS } from "@/src/constants/colors";

type Props = {
  match: FSMatch;
  user: AppUserContext | null;
  joining: boolean;
  onJoin: () => void;
};

export default function MatchActionButton({ match, user, joining, onJoin }: Props) {
  if (user && match.players.includes(user.id)) {
    return (
      <TouchableOpacity
        style={styles.btn}
        onPress={() =>
          router.push({ pathname: "/chat/[matchId]", params: { matchId: match.id, matchName: match.matchName } })
        }
      >
        <Ionicons name="chatbubble-outline" size={18} color="#fff" />
        <Text style={styles.btnText}>Open Chat</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.btn, styles.joinBtn, joining && styles.btnDisabled]}
      disabled={joining || match.status === "full"}
      onPress={onJoin}
    >
      {joining ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>{match.status === "full" ? "Match Full" : "Join Match"}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  joinBtn: { backgroundColor: "#4caf50" },
  btnDisabled: { opacity: 0.5 },
});

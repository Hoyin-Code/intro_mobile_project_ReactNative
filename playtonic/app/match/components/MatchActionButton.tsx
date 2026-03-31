import { AppUserContext } from "@/src/models/appUserContext";
import { FSMatch } from "@/src/models/match.model";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { COLORS } from "@/src/constants/colors";
import { isMainThread } from "node:worker_threads";
import { isMatchOngoing } from "@/src/utils/matchUtils";

type Props = {
  match: FSMatch;
  user: AppUserContext | null;
  joining: boolean;
  onJoin: () => void;
  onLeaving: () => void;
  hostId: string;
  onCancel: () => void;
};

export default function MatchActionButton({
  match,
  user,
  joining,
  onJoin,
  onLeaving,
  hostId,
  onCancel,
}: Props) {
  const ishost = user?.id == match.hostId;
  const matchstatus = isMatchOngoing(match);
  if (user && match.players.includes(user.id)) {
    return (
      <>
        <TouchableOpacity
          style={styles.joinbtn}
          onPress={() =>
            router.push({
              pathname: "/chat/[matchId]",
              params: { matchId: match.id, matchName: match.matchName },
            })
          }
        >
          <Ionicons name="chatbubble-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Open Chat</Text>
        </TouchableOpacity>
        {ishost ? (
          <TouchableOpacity style={styles.leavebtn} onPress={() => onCancel()}>
            <Ionicons name="exit" size={18} color="#fff" />
            <Text style={styles.btnText}>Cancel Game</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.leavebtn} onPress={() => onLeaving}>
            <Ionicons name="exit" size={18} color="#fff" />
            <Text style={styles.btnText}>Leave Game</Text>
          </TouchableOpacity>
        )}
      </>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.joinbtn, styles.joinBtn, joining && styles.btnDisabled]}
      disabled={joining || match.status === "full"}
      onPress={onJoin}
    >
      {joining ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Ionicons name="person-add-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>
            {match.status === "full" ? "Match Full" : "Join Match"}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  joinbtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  leavebtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.delete,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  joinBtn: { backgroundColor: "#4caf50" },
  btnDisabled: { opacity: 0.5 },
});

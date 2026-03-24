import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { COLORS } from "@/src/constants/colors";

type Props = {
  matchId: string;
  matchName: string;
};

export default function ChatHeader({ matchId, matchName }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="chevron-back" size={22} color="#111" />
      </TouchableOpacity>
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {matchName}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.infoBtn}
        onPress={() =>
          router.push({ pathname: "/match/[matchId]", params: { matchId } })
        }
      >
        <Ionicons name="information-circle-outline" size={24} color={COLORS.accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
    gap: 8,
    paddingTop: 50,
    height: 100,
  },
  backBtn: { padding: 4 },
  center: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: "#111" },
  infoBtn: { padding: 4 },
});

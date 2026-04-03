import { COLORS } from "../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: number;
  empty?: boolean;
  bordered?: boolean;
};

export default function Avatar({
  uri,
  name,
  size = 44,
  empty = false,
  bordered = false,
}: Props) {
  const radius = size / 2;
  const base = { width: size, height: size, borderRadius: radius };
  const border = bordered ? { borderWidth: 2, borderColor: "#eee" } : {};

  if (empty) {
    return (
      <View style={[styles.fallback, styles.emptySlot, base, border]}>
        <Ionicons name="person-add-outline" size={size * 0.4} color="#ccc" />
      </View>
    );
  }
  if (uri) {
    return <Image source={{ uri }} style={[base, border]} />;
  }
  return (
    <View style={[styles.fallback, styles.initials, base, border]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>
        {name?.[0]?.toUpperCase() ?? "?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { justifyContent: "center", alignItems: "center" },
  initials: { backgroundColor: COLORS.accent },
  emptySlot: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
  },
  initial: { fontWeight: "700", color: "#fff" },
});

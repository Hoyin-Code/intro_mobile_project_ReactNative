import { StyleSheet, Text, View } from "react-native";

const COLORS: Record<string, { bg: string; text: string }> = {
  open:      { bg: "#e6f4ea", text: "#2e7d32" },
  full:      { bg: "#fdecea", text: "#c62828" },
  ongoing:   { bg: "#e6f4ea", text: "#2e7d32" },
  upcoming:  { bg: "#e8f0fe", text: "#1565c0" },
  completed: { bg: "#ede7f6", text: "#4527a0" },
  cancelled: { bg: "#f5f5f5", text: "#757575" },
};

type Props = {
  label: string;
  variant?: keyof typeof COLORS;
};

export default function Badge({ label, variant }: Props) {
  const color = variant ? COLORS[variant] : { bg: "#f0f0f0", text: "#333" };
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: "flex-start" },
  text: { fontSize: 12, fontWeight: "700" },
});

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: IoniconsName;
  title: string;
  subtitle?: string;
};

export default function EmptyState({ icon, title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color="#ddd" />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },
  title: { fontSize: 16, fontWeight: "700", color: "#bbb" },
  subtitle: { fontSize: 13, color: "#ccc" },
});

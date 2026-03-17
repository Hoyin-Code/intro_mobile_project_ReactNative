import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

type Props = {
  icon: IoniconsName;
  text: string;
  iconColor?: string;
};

export default function InfoRow({ icon, text, iconColor = "#555" }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={iconColor} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  text: { fontSize: 14, color: "#444", flex: 1 },
});

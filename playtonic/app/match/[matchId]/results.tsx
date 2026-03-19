import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function MatchResults() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match Results</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f9", padding: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#111", marginTop: 50 },
});

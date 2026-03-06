import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ClubDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // tijdelijk data van club
  const club = {
    name:
      id === "1"
        ? "Badminton Club A"
        : id === "2"
          ? "Badminton Club B"
          : "Badminton Club C",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.title}>{club.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text>ClubID: {id}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButton: {
    marginRight: 10,
  },
  backText: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
});

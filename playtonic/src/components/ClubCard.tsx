import { FSVenue } from "@/src/models/venue.model";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function ClubCard({ venue: venue }: { venue: FSVenue }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/venue/[venueId]/info",
          params: { venueId: venue.id },
        })
      }
    >
      <Image source={{ uri: venue.imageUrl as string }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{venue.name}</Text>
        <Text style={styles.location}>{venue.address}</Text>
        <Text>
          <Ionicons name="time-outline" size={15} />
          {venue.openTime} - {venue.closeTime}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 250,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#dfdfdf",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "66%",
  },
  info: {
    height: "34%",
    padding: 10,
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  location: {
    color: "#666",
  },
});

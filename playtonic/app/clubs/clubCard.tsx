import { Club } from "@/src/models/club";
import { useRouter } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function ClubCard({ club }: { club: Club }) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.container}
      onPress={() =>
        router.push({
          pathname: "/clubs/[id]",
          params: { id: club.id },
        })
      }
    >
      <Image source={club.image} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{club.name}</Text>
        <Text style={styles.location}>{club.location}</Text>
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

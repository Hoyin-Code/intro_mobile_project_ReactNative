import { Club } from "@/src/models/club";
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import ClubCard from "../clubs/clubCard";

const clubs: Club[] = [
  {
    id: "1",
    name: "Badminton Club A",
    location: "Antwerp",
    image: require("../../assets/images/badminton_veld.jpg"),
  },
  {
    id: "2",
    name: "Badminton Club B",
    location: "Brussels",
    image: require("../../assets/images/badminton_veld.jpg"),
  },
  {
    id: "3",
    name: "Badminton Club C",
    location: "Ghent",
    image: require("../../assets/images/badminton_veld.jpg"),
  },
];

const Index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.homeContent}>Today is a great day to play</Text>

      <FlatList
        initialNumToRender={6}
        data={clubs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClubCard club={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  homeContent: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 20,
  },
});

export default Index;

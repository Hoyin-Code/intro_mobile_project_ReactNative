import { FSVenue } from "@/src/models/venue.model";
import { getVenues } from "@/src/services/venueService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ClubCard from "../components/clubCard";

import { COLORS } from "@/src/constants/colors";

const Index = () => {
  const [venues, setVenues] = useState<FSVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenues()
      .then(setVenues)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Today is a great day to play</Text>
        <Text style={styles.title}>Choose your Venue</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.accent} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          initialNumToRender={6}
          data={venues}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ClubCard venue={item} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  greeting: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111",
  },
  list: {
    paddingHorizontal: 15,
    paddingVertical: 16,
  },
});

export default Index;

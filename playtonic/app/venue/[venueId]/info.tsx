import { FSVenue } from "@/src/models/venue.model";
import { VenueContext } from "@/src/models/venueContext";
import { getVenueById } from "@/src/services/venueService";
import { useGlobalSearchParams } from "expo-router";
import { setegid } from "node:process";
import { useContext, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function VenueInfo() {
  const venue = useContext(VenueContext);
  // TODO: add map with google api and add coordinates to venue model
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styles.title}>{venue.venue?.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
  },
});

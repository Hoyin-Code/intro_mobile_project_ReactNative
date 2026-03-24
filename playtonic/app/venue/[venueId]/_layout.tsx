import { VenueContext } from "@/src/models/venueContext";
import { FSCourt, FSVenue } from "@/src/models/venue.model";
import { getCourtsByVenue, getVenueById } from "@/src/services/venueService";
import { Tabs, useGlobalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { COLORS } from "@/src/constants/colors";

const SCREENS = [
  { name: "info", label: "Info" },
  { name: "reserve", label: "Book" },
  { name: "openGames", label: "Open Matches" },
] as const;

export default function VenueLayout() {
  const { venueId } = useGlobalSearchParams<{ venueId: string }>();
  const [venue, setVenue] = useState<FSVenue | null>(null);
  const [courts, setCourts] = useState<FSCourt[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!venueId) { setLoading(false); return; }
    setLoading(true);
    getVenueById(venueId)
      .then((v) => {
        setVenue(v);
        if (v) return getCourtsByVenue(v.id).then(setCourts);
      })
      .finally(() => setLoading(false));
  }, [venueId]);

  return (
    <VenueContext.Provider value={{ venue, courts, loading }}>
      <Tabs
        screenOptions={{
          tabBarStyle: { display: "none" },
          header: ({ route }) => (
            <View style={styles.header}>
              {venue?.imageUrl ? (
                <Image
                  source={{ uri: venue.imageUrl }}
                  style={styles.venueImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.venueImage, styles.imagePlaceholder]} />
              )}
              <View style={styles.nameBar}>
                <Text style={styles.venueName}>{venue?.name ?? ""}</Text>
                {venue?.address ? (
                  <Text style={styles.venueAddress}>{venue.address}</Text>
                ) : null}
              </View>
              <View style={styles.tabBar}>
                {SCREENS.map((s) => {
                  const active = route.name === s.name;
                  return (
                    <TouchableOpacity
                      key={s.name}
                      style={styles.tab}
                      onPress={() =>
                        router.replace(`/venue/${venueId}/${s.name}` as any)
                      }
                    >
                      <Text
                        style={[styles.tabText, active && styles.tabTextActive]}
                      >
                        {s.label}
                      </Text>
                      {active && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ),
        }}
      >
        <Tabs.Screen name="info" />
        <Tabs.Screen name="reserve" />
        <Tabs.Screen name="openGames" />
      </Tabs>
    </VenueContext.Provider>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  venueImage: {
    width: "100%",
    height: 200,
  },
  imagePlaceholder: {
    backgroundColor: "#ddd",
  },
  nameBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  venueName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
  },
  venueAddress: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  tabTextActive: {
    color: COLORS.accent,
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  header1: {
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

import { VenueContext } from "@/src/models/venueContext";
import { Ionicons } from "@expo/vector-icons";
import { useContext, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Facility } from "@/src/models/venue.model";
const ACCENT = "rgb(111, 161, 226)";

export default function VenueInfo() {
  const { venue, courts, loading: venueLoading } = useContext(VenueContext);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const facilities: Facility[] = venue?.facilities ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      scrollEnabled={scrollEnabled}
    >
      {venueLoading ? (
        <ActivityIndicator color={ACCENT} style={styles.loader} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Club facilities</Text>

          <View style={styles.hList}>
            {facilities.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.chip,
                  { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={"#656565"}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.chipText}>{item.name}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.sectionTitle}>Courts</Text>

          <View style={styles.hList}>
            {courts.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.chip,
                  { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <Ionicons
                  name="tennisball-sharp"
                  size={16}
                  color={"#656565"}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.chipText}>{item.name}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Location</Text>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Ionicons name="location-outline" size={20}></Ionicons>
            <Text style={styles.chipText}>{venue?.address}</Text>
          </View>
          <View
            onTouchStart={() => setScrollEnabled(false)}
            onTouchEnd={() => setScrollEnabled(true)}
            onTouchCancel={() => setScrollEnabled(true)}
          >
            <MapView
              style={styles.map}
              scrollEnabled={false}
              rotateEnabled={false}
              scrollDuringRotateOrZoomEnabled={false}
              initialRegion={{
                latitude: venue?.latitude ?? 51.2194,
                longitude: venue?.longitude ?? 4.4025,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              {venue && (
                <Marker
                  coordinate={{
                    latitude: venue.latitude,
                    longitude: venue.longitude,
                  }}
                  title={venue.name}
                  description={venue.address}
                  pinColor={ACCENT}
                />
              )}
            </MapView>
          </View>
          <Text style={styles.sectionTitle}>Opening hours</Text>
          <View>
            <Text style={styles.chipText}>
              Monday - Sunday: {venue?.openTime} - {venue?.closeTime}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f9" },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginTop: 20,
    marginBottom: 10,
  },
  loader: { marginVertical: 16 },
  hList: {
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  chipText: { fontSize: 14, fontWeight: "600", color: "#656565" },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginTop: 10,
  },
});

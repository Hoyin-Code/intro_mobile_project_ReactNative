import { VenueContext } from "@/src/models/venueContext";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import MapView, { Marker } from "react-native-maps";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Facility } from "@/src/models/facility.model";

const ACCENT = "rgb(111, 161, 226)";

export default function VenueInfo() {
  const { venue, courts, loading: venueLoading } = useContext(VenueContext);
  const facilities: Facility[] = [
    { id: "1", name: "Food", icon: "fast-food" },
    { id: "2", name: "Drinks", icon: "beer" },
    { id: "3", name: "Wi-Fi", icon: "wifi" },
    { id: "4", name: "Dressing room", icon: "person" },
    { id: "5", name: "Parking lot", icon: "car" },
    { id: "6", name: "Accessible", icon: "accessibility" },
    { id: "7", name: "Rental", icon: "basket" },
    { id: "8", name: "Terrace", icon: "cafe" },
    { id: "9", name: "Night Courts", icon: "moon" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {venueLoading ? (
        <ActivityIndicator color={ACCENT} style={styles.loader} />
      ) : (
        <>
          <Text style={styles.sectionTitle}>Club facilities</Text>
          <FlatList
            data={facilities}
            keyExtractor={(c) => c.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <View
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
            )}
          />
          <Text style={styles.sectionTitle}>Courts</Text>

          <FlatList
            data={courts}
            keyExtractor={(c) => c.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hList}
            renderItem={({ item }) => (
              <View
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
            )}
          />
          <Text style={styles.sectionTitle}>Location</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: /*courts[0]?.lat || */ 52.0,
              longitude: /*courts[0]?.lng || */ 5.0,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {courts.map((court) => (
              <Marker
                key={court.id}
                coordinate={{
                  latitude: /* court.lat*/ 52.0,
                  longitude: /* court.lng*/ 5.0,
                }}
                title={court.name}
              />
            ))}
          </MapView>
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
  hList: { gap: 10 },
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

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

const ACCENT = "rgb(111, 161, 226)";

export default function VenueInfo() {
  const { venue, courts, loading: venueLoading } = useContext(VenueContext);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {venueLoading && (
        <ActivityIndicator color={ACCENT} style={styles.loader} />
      )}

      <Text style={styles.sectionTitle}>Clubinformation</Text>
      {venueLoading ? (
        <ActivityIndicator color={ACCENT} style={styles.loader} />
      ) : (
        <>
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
                  size={20}
                  color="green"
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
  chipText: { fontSize: 14, fontWeight: "600", color: "#333" },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginTop: 10,
  },
});

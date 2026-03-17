import { getVenues } from "@/src/services/venueService";
import { FSVenue } from "@/src/models/venue.model";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "rgb(111, 161, 226)";

export default function SelectVenue() {
  const router = useRouter();
  const [venues, setVenues] = useState<FSVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await getVenues();
    setVenues(data);
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ACCENT} />
      </View>
    );
  }

  return (
    <FlatList
      data={venues}
      keyExtractor={(v) => v.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
      }
      ListHeaderComponent={
        <Text style={styles.subtitle}>Choose a venue to host your match</Text>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No venues available</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.75}
          onPress={() => router.push(`/create-match/${item.id}`)}
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={32} color="#ccc" />
            </View>
          )}
          <View style={styles.cardBody}>
            <Text style={styles.venueName}>{item.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={13} color="#888" />
              <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={13} color="#888" />
              <Text style={styles.infoText}>{item.openTime} – {item.closeTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="tennisball-outline" size={13} color="#888" />
              <Text style={styles.infoText}>
                {item.courts.filter((c) => c.isActive).length} court
                {item.courts.filter((c) => c.isActive).length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#ccc" style={styles.chevron} />
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f9",
  },
  list: {
    padding: 16,
    gap: 12,
    backgroundColor: "#f7f7f9",
    flexGrow: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: 90,
    height: 90,
  },
  imagePlaceholder: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  venueName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  infoText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  chevron: {
    marginRight: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingTop: 60,
  },
  emptyText: { fontSize: 15, color: "#aaa" },
});

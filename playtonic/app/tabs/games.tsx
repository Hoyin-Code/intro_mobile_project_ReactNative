import { COLORS } from "@/src/constants/colors";
import { useGames, isFilterActive } from "@/src/hooks/useGames";
import EmptyState from "@/src/components/EmptyState";
import MatchCard from "./components/MatchCard";
import FilterModal from "./components/FilterModal";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Games() {
  const router = useRouter();
  const { loading, refreshing, onRefresh, filtered, filter, filterModalVisible, openFilter, closeFilter, applyFilter } =
    useGames();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>Find a Match</Text>
            <TouchableOpacity onPress={openFilter}>
              <Ionicons
                name="filter-circle-outline"
                size={35}
                color={isFilterActive(filter) ? COLORS.accent : "#111"}
              />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="tennisball-outline" title="No open matches found" />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => router.push({ pathname: "/match/[matchId]", params: { matchId: item.id } })}
          />
        )}
      />
      <FilterModal
        visible={filterModalVisible}
        filter={filter}
        onApply={applyFilter}
        onClose={closeFilter}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f9",
  },
  list: { padding: 16, gap: 12, backgroundColor: "#f7f7f9", flexGrow: 1 },
  screenTitle: { fontSize: 22, fontWeight: "800", color: "#111" },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
});

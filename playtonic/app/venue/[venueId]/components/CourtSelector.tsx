import { FSCourt } from "@/src/models/venue.model";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { COLORS } from "@/src/constants/colors";

type Props = {
  courts: FSCourt[];
  selectedCourt: FSCourt | null;
  onSelectCourt: (court: FSCourt) => void;
  loading: boolean;
};

export default function CourtSelector({
  courts,
  selectedCourt,
  onSelectCourt,
  loading,
}: Props) {
  if (loading)
    return <ActivityIndicator color={COLORS.accent} style={styles.loader} />;
  return (
    <FlatList
      data={courts}
      keyExtractor={(c) => c.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hList}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.chip,
            selectedCourt?.id === item.id && styles.chipSelected,
          ]}
          onPress={() => onSelectCourt(item)}
        >
          <Text
            style={[
              styles.chipText,
              selectedCourt?.id === item.id && styles.chipTextSelected,
            ]}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  loader: { marginVertical: 16 },
  hList: { gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  chipSelected: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  chipText: { fontSize: 14, fontWeight: "600", color: "#333" },
  chipTextSelected: { color: "#fff" },
});

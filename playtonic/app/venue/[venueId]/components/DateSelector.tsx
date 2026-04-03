import { DAY_NAMES, MONTH_NAMES } from "@/src/constants/dates";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";

import { COLORS } from "@/src/constants/colors";

type Props = {
  dates: Date[];
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
};

export default function DateSelector({
  dates,
  selectedDate,
  onSelectDate,
}: Props) {
  return (
    <FlatList
      data={dates}
      keyExtractor={(d) => d.toISOString()}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hList}
      renderItem={({ item }) => {
        const isSelected = selectedDate?.toDateString() === item.toDateString();
        return (
          <TouchableOpacity
            style={[styles.dateCard, isSelected && styles.dateCardSelected]}
            onPress={() => onSelectDate(item)}
          >
            <Text
              style={[styles.dateDow, isSelected && styles.dateTextSelected]}
            >
              {DAY_NAMES[item.getDay()]}
            </Text>
            <Text
              style={[styles.dateNum, isSelected && styles.dateTextSelected]}
            >
              {item.getDate()}
            </Text>
            <Text
              style={[styles.dateMon, isSelected && styles.dateTextSelected]}
            >
              {MONTH_NAMES[item.getMonth()]}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  hList: { gap: 10 },
  dateCard: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    minWidth: 58,
  },
  dateCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent,
  },
  dateDow: { fontSize: 11, fontWeight: "600", color: "#888" },
  dateNum: { fontSize: 20, fontWeight: "800", color: "#111", lineHeight: 26 },
  dateMon: { fontSize: 11, fontWeight: "600", color: "#888" },
  dateTextSelected: { color: "#fff" },
});

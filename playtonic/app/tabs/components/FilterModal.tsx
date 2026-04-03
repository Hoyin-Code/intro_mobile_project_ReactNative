import { COLORS } from "@/src/constants/colors";
import { DAY_NAMES, MONTH_NAMES } from "@/src/constants/dates";
import { getDates } from "@/src/hooks/useVenueBooking";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DATES = getDates(20);
const FROM_HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6–21
const TO_HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7–22
const ITEM_HEIGHT = 48;

const SKILL_FILTERS: { label: string; min: number; max: number }[] = [
  { label: "All", min: 0.5, max: 7.0 },
  { label: "1–2", min: 0.5, max: 2.0 },
  { label: "2–3.5", min: 2.0, max: 3.5 },
  { label: "3.5–5", min: 3.5, max: 5.0 },
  { label: "5–7", min: 5.0, max: 7.0 },
];

export interface FilterState {
  dates: Set<string>;
  fromHour: number;
  toHour: number;
  minSkill: number;
  maxSkill: number;
  gender: "all" | "mixed" | "same";
}

interface Props {
  visible: boolean;
  filter: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

interface TimePickerProps {
  hours: number[];
  value: number;
  onChange: (h: number) => void;
}

function TimePicker({ hours, value, onChange }: TimePickerProps) {
  const ref = useRef<FlatList>(null);
  const initialIndex = Math.max(0, hours.indexOf(value));

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(idx, hours.length - 1));
    onChange(hours[clamped]);
  };

  return (
    <View style={styles.pickerWrapper}>
      <View style={styles.pickerHighlight} pointerEvents="none" />
      <FlatList
        ref={ref}
        data={hours}
        keyExtractor={(h) => String(h)}
        style={styles.picker}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => {
          const active = item === value;
          return (
            <View style={styles.pickerItem}>
              <Text
                style={[
                  styles.pickerItemText,
                  active && styles.pickerItemTextActive,
                ]}
              >
                {formatHour(item)}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}

export default function FilterModal({
  visible,
  filter,
  onApply,
  onClose,
}: Props) {
  const [localFilter, setLocalFilter] = React.useState<FilterState>(filter);
  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    if (visible) {
      setLocalFilter(filter);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const toggleDate = (date: Date) => {
    setLocalFilter((prev) => {
      const next = new Set(prev.dates);
      const key = date.toDateString();
      next.has(key) ? next.delete(key) : next.add(key);
      return { ...prev, dates: next };
    });
  };

  const reset = () =>
    setLocalFilter({
      dates: new Set(),
      fromHour: 6,
      toHour: 22,
      minSkill: 0.5,
      maxSkill: 7.0,
      gender: "all",
    });
  onApply(localFilter);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.handle} />

        <View style={styles.headerRow}>
          <Text style={styles.title}>Filter Matches</Text>
          <TouchableOpacity onPress={reset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Gender filter */}
        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.chipRow}>
          {(["all", "mixed", "same"] as const).map((g) => {
            const label =
              g === "all" ? "All" : g === "mixed" ? "Mixed" : "Same Gender";
            const active = localFilter.gender === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() =>
                  setLocalFilter((prev) => ({ ...prev, gender: g }))
                }
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Skill filter */}
        <Text style={styles.sectionLabel}>Skill Level</Text>
        <View style={styles.chipRow}>
          {SKILL_FILTERS.map((sf) => {
            const active =
              localFilter.minSkill === sf.min &&
              localFilter.maxSkill === sf.max;
            return (
              <TouchableOpacity
                key={sf.label}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() =>
                  setLocalFilter((prev) => ({
                    ...prev,
                    minSkill: sf.min,
                    maxSkill: sf.max,
                  }))
                }
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {sf.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date selector */}
        <Text style={styles.sectionLabel}>Day</Text>
        <FlatList
          horizontal
          data={DATES}
          keyExtractor={(d) => d.toDateString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateList}
          renderItem={({ item }) => {
            const active = localFilter.dates.has(item.toDateString());
            return (
              <TouchableOpacity
                style={[styles.dateCard, active && styles.dateCardActive]}
                onPress={() => toggleDate(item)}
              >
                <Text style={[styles.dateDow, active && styles.dateTextActive]}>
                  {DAY_NAMES[item.getDay()]}
                </Text>
                <Text style={[styles.dateNum, active && styles.dateTextActive]}>
                  {item.getDate()}
                </Text>
                <Text style={[styles.dateMon, active && styles.dateTextActive]}>
                  {MONTH_NAMES[item.getMonth()]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Time range — snap-scroll pickers */}
        <Text style={styles.sectionLabel}>Time Range</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeCol}>
            <Text style={styles.timeColLabel}>From</Text>
            <TimePicker
              hours={FROM_HOURS}
              value={localFilter.fromHour}
              onChange={(h) =>
                setLocalFilter((prev) => ({
                  ...prev,
                  fromHour: h,
                  toHour: Math.max(prev.toHour, h + 1),
                }))
              }
            />
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeCol}>
            <Text style={styles.timeColLabel}>To</Text>
            <TimePicker
              key={localFilter.fromHour}
              hours={TO_HOURS.filter((h) => h > localFilter.fromHour)}
              value={localFilter.toHour}
              onChange={(h) =>
                setLocalFilter((prev) => ({ ...prev, toHour: h }))
              }
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => onApply(localFilter)}
        >
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    gap: 6,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: { fontSize: 17, fontWeight: "800", color: "#111" },
  resetText: { fontSize: 14, color: COLORS.accent, fontWeight: "600" },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#555",
    marginTop: 10,
  },

  // Skill chips
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: 13, fontWeight: "600", color: "#666" },
  chipTextActive: { color: "#fff" },

  // Date selector
  dateList: { gap: 10, paddingVertical: 4 },
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
  dateCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent,
  },
  dateDow: { fontSize: 11, fontWeight: "600", color: "#888" },
  dateNum: { fontSize: 20, fontWeight: "800", color: "#111", lineHeight: 26 },
  dateMon: { fontSize: 11, fontWeight: "600", color: "#888" },
  dateTextActive: { color: "#fff" },

  // Time pickers
  timeRow: { flexDirection: "row", marginTop: 6, gap: 12 },
  timeCol: { flex: 1, alignItems: "center" },
  timeColLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#888",
    marginBottom: 6,
  },
  pickerWrapper: {
    width: "100%",
    height: ITEM_HEIGHT,
    overflow: "hidden",
    borderRadius: 10,
  },
  pickerHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.selector + "18",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.selector + "55",
  },
  picker: { flex: 1 },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  pickerItemTextActive: {
    fontWeight: "800",
    fontSize: 18,
  },
  timeDivider: {
    width: 1,
    backgroundColor: "#eee",
    alignSelf: "stretch",
    marginTop: 28,
  },

  applyBtn: {
    marginTop: 14,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

import { TimeSlot } from "@/src/hooks/useVenueBooking";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACCENT = "rgb(111, 161, 226)";

type Props = {
  slots: TimeSlot[];
  takenSlots: Set<string>;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading: boolean;
  courtAndDateSelected: boolean;
};

export default function TimeSlotGrid({
  slots,
  takenSlots,
  selectedDate,
  selectedSlot,
  onSelectSlot,
  loading,
  courtAndDateSelected,
}: Props) {
  if (!courtAndDateSelected) {
    return <Text style={styles.empty}>Select a court and date first.</Text>;
  }
  if (loading) return <ActivityIndicator color={ACCENT} style={styles.loader} />;
  if (slots.length === 0) return <Text style={styles.empty}>No slots available.</Text>;

  return (
    <View style={styles.slotGrid}>
      {slots.map((slot) => {
        const taken = takenSlots.has(slot.startTime);
        const isPast = (() => {
          if (!selectedDate) return false;
          const now = new Date();
          if (selectedDate.toDateString() !== now.toDateString()) return false;
          const [h, m] = slot.startTime.split(":").map(Number);
          return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
        })();
        const isSelected = selectedSlot?.startTime === slot.startTime;
        return (
          <TouchableOpacity
            key={slot.startTime}
            disabled={taken || isPast}
            onPress={() => onSelectSlot(slot)}
            style={[styles.slot, (taken || isPast) && styles.slotTaken, isSelected && styles.slotSelected]}
          >
            <Text style={[styles.slotText, (taken || isPast) && styles.slotTextTaken, isSelected && styles.slotTextSelected]}>
              {slot.startTime}
            </Text>
            <Text style={[styles.slotSub, (taken || isPast) && styles.slotTextTaken, isSelected && styles.slotTextSelected]}>
              {slot.endTime}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { marginVertical: 16 },
  empty: { color: "#999", fontStyle: "italic", marginVertical: 8 },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slot: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    minWidth: 75,
  },
  slotSelected: { borderColor: ACCENT, backgroundColor: ACCENT },
  slotTaken: { backgroundColor: "#f0f0f0", borderColor: "#e0e0e0" },
  slotText: { fontSize: 14, fontWeight: "700", color: "#111" },
  slotSub: { fontSize: 11, color: "#777", marginTop: 2 },
  slotTextSelected: { color: "#fff" },
  slotTextTaken: { color: "#bbb" },
});

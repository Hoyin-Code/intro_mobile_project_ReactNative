import { SlotMatch, TimeSlot } from "@/src/hooks/useVenueBooking";
import { router } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ACCENT = "rgb(111, 161, 226)";
const ACCENTBORDER = "rgb(70, 132, 213)";
const MATCH_COLOR = "rgb(138, 219, 170)";
const MATCH_FULL_COLOR = "rgb(220, 80, 80)";

type Props = {
  slots: TimeSlot[];
  takenSlots: Set<string>;
  slotJoinable?: Set<String>;
  slotMatches?: Map<string, SlotMatch>;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  loading: boolean;
  courtAndDateSelected: boolean;
};

export default function TimeSlotGrid({
  slots,
  takenSlots,
  slotMatches,
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
        const matchData = slotMatches?.get(slot.startTime);
        const hasMatch = !!matchData;
        const isFull = hasMatch && matchData.players.length >= matchData.match.maxPlayers;
        const isPast = (() => {
          if (!selectedDate) return false;
          const now = new Date();
          if (selectedDate.toDateString() !== now.toDateString()) return false;
          const [h, m] = slot.startTime.split(":").map(Number);
          return h * 60 + m <= now.getHours() * 60 + now.getMinutes();
        })();
        const isSelected = selectedSlot?.startTime === slot.startTime;

        const handlePress = () => {
          if (hasMatch) {
            router.push({ pathname: "/match/[matchId]", params: { matchId: matchData.match.id } });
          } else {
            onSelectSlot(slot);
          }
        };

        return (
          <TouchableOpacity
            key={slot.startTime}
            disabled={taken && !hasMatch || isPast}
            onPress={handlePress}
            style={[
              styles.slot,
              (taken && !hasMatch || isPast) && styles.slotTaken,
              isSelected && styles.slotSelected,
              hasMatch && (isFull ? styles.slotMatchFull : styles.slotMatch),
              hasMatch && (isPast ?styles.slotTaken : styles.slotMatch)
            ]}
          >
            <Text style={[
              styles.slotText,
              (taken && !hasMatch || isPast) && styles.slotTextTaken,
              isSelected && styles.slotTextSelected,
              (hasMatch && !isPast) && styles.slotTextMatch
              ]}>
              {slot.startTime}
            </Text>
            <Text style={[
              styles.slotSub,
              (taken && !hasMatch || isPast) && styles.slotTextTaken,
              isSelected && styles.slotTextSelected,
              hasMatch && styles.slotTextMatch,
              (hasMatch && isPast) &&styles.slotTextTaken
            ]}>
              {slot.endTime}
            </Text>
            {(hasMatch && !isPast) && (
              <Text style={styles.slotMatchLabel}>
                {matchData?.match.players.length}/{matchData?.match.maxPlayers}
              </Text>
            )}
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
    height:70,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    minWidth: 75,
  },
  slotSelected: { borderColor: ACCENT, backgroundColor: ACCENTBORDER },
  slotTaken: { backgroundColor: "#f0f0f0", borderColor: "#e0e0e0" },
  slotMatch: { backgroundColor: MATCH_COLOR, borderColor: "rgb(56, 147, 92)" },
  slotMatchFull: { backgroundColor: MATCH_FULL_COLOR, borderColor: "rgb(180, 40, 40)" },
  slotJoinable: { backgroundColor: ACCENT },
  slotText: { fontSize: 14, fontWeight: "700", color: "#111" },
  slotSub: { fontSize: 11, color: "#777", marginTop: 2 },
  slotTextSelected: { color: "#fff" },
  slotTextTaken: { color: "#bbb" },
  slotTextMatch: { color: "#fff" },
  slotMatchLabel: { fontSize: 10, color: "#fff", fontWeight: "600" },
});

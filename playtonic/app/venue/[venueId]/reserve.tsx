import {
  DAY_NAMES,
  getDates,
  MONTH_NAMES,
  useVenueBooking,
} from "@/src/hooks/useVenueBooking";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "rgb(111, 161, 226)";
const dates = getDates(50);

export default function Reserve() {
  const {
    venue,
    venueLoading,
    courts,
    selectedCourt,
    selectedDate,
    slots,
    takenSlots,
    slotsLoading,
    selectedSlot,
    setSelectedSlot,
    booking,
    onSelectCourt,
    onSelectDate,
    onBook,
    confirm,
  } = useVenueBooking();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {venueLoading && (
        <ActivityIndicator color={ACCENT} style={styles.loader} />
      )}

      {/* Courts */}
      <Text style={styles.sectionTitle}>Select Court</Text>
      {venueLoading ? (
        <ActivityIndicator color={ACCENT} style={styles.loader} />
      ) : (
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
      )}

      {/* Date */}
      <Text style={styles.sectionTitle}>Select Date</Text>
      <FlatList
        data={dates}
        keyExtractor={(d) => d.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hList}
        renderItem={({ item }) => {
          const isSelected =
            selectedDate?.toDateString() === item.toDateString();
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

      {/* Time Slots */}
      <Text style={styles.sectionTitle}>Select Time</Text>
      {!selectedCourt || !selectedDate ? (
        <Text style={styles.empty}>Select a court and date first.</Text>
      ) : slotsLoading ? (
        <ActivityIndicator color={ACCENT} style={styles.loader} />
      ) : slots.length === 0 ? (
        <Text style={styles.empty}>No slots available.</Text>
      ) : (
        <View style={styles.slotGrid}>
          {slots.map((slot) => {
            const taken = takenSlots.has(slot.startTime);
            const isSelected = selectedSlot?.startTime === slot.startTime;
            return (
              <TouchableOpacity
                key={slot.startTime}
                disabled={taken}
                onPress={() => setSelectedSlot(slot)}
                style={[
                  styles.slot,
                  taken && styles.slotTaken,
                  isSelected && styles.slotSelected,
                ]}
              >
                <Text
                  style={[
                    styles.slotText,
                    taken && styles.slotTextTaken,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.startTime}
                </Text>
                <Text
                  style={[
                    styles.slotSub,
                    taken && styles.slotTextTaken,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot.endTime}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Confirm button — only when all fields selected */}
      {selectedSlot && selectedCourt && selectedDate && venue && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Ionicons name="location-outline" size={16} color="#555" />
            <Text style={styles.summaryText}>
              {venue.name} · {selectedCourt.name}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="calendar-outline" size={16} color="#555" />
            <Text style={styles.summaryText}>
              {DAY_NAMES[selectedDate.getDay()]},{" "}
              {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Ionicons name="time-outline" size={16} color="#555" />
            <Text style={styles.summaryText}>
              {selectedSlot.startTime} – {selectedSlot.endTime}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bookBtn, booking && styles.bookBtnDisabled]}
            onPress={confirm}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookBtnText}>Confirm Booking</Text>
            )}
          </TouchableOpacity>
        </View>
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
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  chipSelected: { borderColor: ACCENT, backgroundColor: ACCENT },
  chipText: { fontSize: 14, fontWeight: "600", color: "#333" },
  chipTextSelected: { color: "#fff" },
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
  dateCardSelected: { borderColor: ACCENT, backgroundColor: ACCENT },
  dateDow: { fontSize: 11, fontWeight: "600", color: "#888" },
  dateNum: { fontSize: 20, fontWeight: "800", color: "#111", lineHeight: 26 },
  dateMon: { fontSize: 11, fontWeight: "600", color: "#888" },
  dateTextSelected: { color: "#fff" },
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
  empty: { color: "#999", fontStyle: "italic", marginVertical: 8 },
  summary: {
    marginTop: 28,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 10,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryText: { fontSize: 14, color: "#333", fontWeight: "500" },
  bookBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

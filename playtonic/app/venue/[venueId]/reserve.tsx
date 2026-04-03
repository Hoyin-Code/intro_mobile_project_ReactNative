import { DAY_NAMES, MONTH_NAMES } from "@/src/constants/dates";
import { getDates } from "@/src/utils/dateUtils";
import { useVenueBooking } from "@/src/hooks/useVenueBooking";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CourtSelector from "./components/CourtSelector";
import DateSelector from "./components/DateSelector";
import TimeSlotGrid from "./components/TimeSlotGrid";

import { COLORS } from "@/src/constants/colors";
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
    confirm,
  } = useVenueBooking();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {venueLoading && (
        <ActivityIndicator color={COLORS.accent} style={styles.loader} />
      )}

      <Text style={styles.pageTitle}>Create a Reservation</Text>

      <Text style={styles.sectionTitle}>Select Court</Text>
      <CourtSelector
        courts={courts}
        selectedCourt={selectedCourt}
        onSelectCourt={onSelectCourt}
        loading={venueLoading}
      />

      <Text style={styles.sectionTitle}>Select Date</Text>
      <DateSelector
        dates={dates}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
      />

      <Text style={styles.sectionTitle}>Select Time</Text>
      <TimeSlotGrid
        slots={slots}
        takenSlots={takenSlots}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        onSelectSlot={setSelectedSlot}
        loading={slotsLoading}
        courtAndDateSelected={!!selectedCourt && !!selectedDate}
      />

      <Text style={styles.sectionTitle}>Confirm your booking</Text>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginTop: 20,
    marginBottom: 10,
  },
  loader: { marginVertical: 16 },
  summary: {
    marginTop: 10,
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
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  bookBtnDisabled: { opacity: 0.6 },
  bookBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

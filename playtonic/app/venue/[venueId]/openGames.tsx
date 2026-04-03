import { COLORS } from "@/src/constants/colors";
import { useCreateMatch } from "@/src/hooks/useCreateMatch";
import { DAY_NAMES, MONTH_NAMES } from "@/src/constants/dates";
import { getDates } from "@/src/utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Switch,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CourtSelector from "./components/CourtSelector";
import DateSelector from "./components/DateSelector";
import SkillLevelSelector from "./components/SkillLevelSelector";
import TimeSlotGrid from "./components/TimeSlotGrid";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const dates = getDates(50);

export default function OpenGames() {
  const {
    venue,
    venueLoading,
    courts,
    selectedCourt,
    selectedDate,
    slots,
    takenSlots,
    slotMatches,
    slotsLoading,
    selectedSlot,
    setSelectedSlot,
    booking,
    onSelectCourt,
    onSelectDate,
    matchName,
    setMatchName,
    competitive,
    setCompetitive,
    mixedTeams,
    setMixedTeams,
    minSkillLevel,
    setMinSkillLevel,
    maxSkillLevel,
    setMaxSkillLevel,
    refreshSlots,
    confirm,
  } = useCreateMatch();

  useFocusEffect(
    useCallback(() => {
      refreshSlots();
    }, [refreshSlots]),
  );

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {venueLoading && (
        <ActivityIndicator color={COLORS.accent} style={styles.loader} />
      )}

      <Text style={styles.pageTitle}>Create a Match</Text>

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
        slotMatches={slotMatches}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        onSelectSlot={setSelectedSlot}
        loading={slotsLoading}
        courtAndDateSelected={!!selectedCourt && !!selectedDate}
      />
      <View style={styles.toggleRow}>
        <Text style={styles.sectionTitle}>Competitive</Text>
        <Switch
          value={competitive}
          onValueChange={setCompetitive}
          trackColor={{ false: "#ddd", true: COLORS.accent }}
          thumbColor="#fff"
        />
      </View>
      {competitive && (
        <>
          <Text style={styles.sectionTitle}>Skill Level Range</Text>
          <SkillLevelSelector
            minSkill={minSkillLevel}
            maxSkill={maxSkillLevel}
            onChangeMin={setMinSkillLevel}
            onChangeMax={setMaxSkillLevel}
          />
        </>
      )}
      <View style={styles.toggleRow}>
        <Text style={styles.sectionTitle}>Mixed Gender</Text>
        <Switch
          value={mixedTeams}
          onValueChange={setMixedTeams}
          trackColor={{ false: "#ddd", true: COLORS.accent }}
          thumbColor="#fff"
        />
      </View>
      <Text style={styles.sectionTitle}>Confirm your Match</Text>
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
          <TextInput
            style={styles.matchNameInput}
            placeholder="Match name (optional)"
            value={matchName}
            onChangeText={setMatchName}
          />
          <TouchableOpacity
            style={[styles.bookBtn, booking && styles.bookBtnDisabled]}
            onPress={confirm}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.bookBtnText}>Create Match</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAwareScrollView>
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
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
  matchNameInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
});

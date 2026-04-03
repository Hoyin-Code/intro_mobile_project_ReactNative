import { COLORS } from "@/src/constants/colors";
import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const MIN = 1;
const MAX = 7;
const TRACK_WIDTH = 280;
const THUMB_SIZE = 26;

function valueToOffset(value: number) {
  "worklet";
  return ((value - MIN) / (MAX - MIN)) * TRACK_WIDTH;
}

function offsetToValue(offset: number) {
  "worklet";
  const clamped = Math.max(0, Math.min(TRACK_WIDTH, offset));
  return Math.round((clamped / TRACK_WIDTH) * (MAX - MIN) + MIN);
}

interface Props {
  minSkill: number;
  maxSkill: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}

export default function SkillLevelSelector({
  minSkill,
  maxSkill,
  onChangeMin,
  onChangeMax,
}: Props) {
  const minX = useSharedValue(valueToOffset(minSkill));
  const maxX = useSharedValue(valueToOffset(maxSkill));

  const minStart = useRef(0);
  const maxStart = useRef(0);

  const minGesture = Gesture.Pan()
    .onStart(() => {
      minStart.current = minX.value;
    })
    .onUpdate((e) => {
      const raw = Math.max(0, minStart.current + e.translationX);
      const snapped = offsetToValue(raw);
      const capped = Math.min(snapped, offsetToValue(maxX.value) - 1);
      minX.value = valueToOffset(capped);
      runOnJS(onChangeMin)(capped);
    });

  const maxGesture = Gesture.Pan()
    .onStart(() => {
      maxStart.current = maxX.value;
    })
    .onUpdate((e) => {
      const raw = Math.min(TRACK_WIDTH, maxStart.current + e.translationX);
      const snapped = offsetToValue(raw);
      const floored = Math.max(snapped, offsetToValue(minX.value) + 1);
      maxX.value = valueToOffset(floored);
      runOnJS(onChangeMax)(floored);
    });

  const rangeStyle = useAnimatedStyle(() => ({
    left: minX.value + THUMB_SIZE / 2,
    width: maxX.value - minX.value,
  }));

  const minThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minX.value }],
  }));

  const maxThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxX.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.labelsRow}>
        <Text style={styles.label}>
          Min: <Text style={styles.labelValue}>{minSkill}</Text>
        </Text>
        <Text style={styles.label}>
          Max: <Text style={styles.labelValue}>{maxSkill}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.range, rangeStyle]} />
        <GestureDetector gesture={minGesture}>
          <Animated.View style={[styles.thumb, minThumbStyle]} />
        </GestureDetector>
        <GestureDetector gesture={maxGesture}>
          <Animated.View style={[styles.thumb, maxThumbStyle]} />
        </GestureDetector>
      </View>
      <View style={styles.tickRow}>
        {Array.from({ length: MAX - MIN + 1 }, (_, i) => i + MIN).map((n) => (
          <Text key={n} style={styles.tick}>
            {n}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#777",
    fontWeight: "500",
  },
  labelValue: {
    color: COLORS.accent,
    fontWeight: "700",
  },
  track: {
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    marginHorizontal: THUMB_SIZE / 2,
    position: "relative",
  },
  range: {
    position: "absolute",
    height: 4,
    backgroundColor: COLORS.accent,
    borderRadius: 2,
    top: 0,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: COLORS.accent,
    top: -(THUMB_SIZE / 2 - 2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 2,
  },
  tick: {
    fontSize: 11,
    color: "#aaa",
    width: THUMB_SIZE,
    textAlign: "center",
  },
});

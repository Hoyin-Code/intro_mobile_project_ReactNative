import { Image, StyleSheet, Text, View } from "react-native";

const ACCENT = "rgb(111, 161, 226)";

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: number;
};

export default function Avatar({ uri, name, size = 44 }: Props) {
  const radius = size / 2;
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius }} />;
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>
        {name?.[0]?.toUpperCase() ?? "?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: ACCENT, justifyContent: "center", alignItems: "center" },
  initial: { fontWeight: "700", color: "#fff" },
});

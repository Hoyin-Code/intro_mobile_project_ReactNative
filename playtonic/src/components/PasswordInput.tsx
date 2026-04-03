import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = Omit<TextInputProps, "secureTextEntry"> & {
  value: string;
  onChangeText: (v: string) => void;
};

export default function PasswordInput({ value, onChangeText, ...rest }: Props) {
  const [hidden, setHidden] = useState(true);
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={hidden}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        {...rest}
      />
      <TouchableOpacity
        style={styles.toggle}
        onPress={() => setHidden((h) => !h)}
      >
        <Ionicons name={hidden ? "eye-off" : "eye"} size={22} color="#555" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  toggle: {
    position: "absolute",
    right: 15,
    margin: 10,
  },
});

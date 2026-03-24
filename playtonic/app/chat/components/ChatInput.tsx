import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/src/constants/colors";

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  onTypingChange?: (isTyping: boolean) => void;
};

export default function ChatInput({ value, onChange, onSend, sending, onTypingChange }: Props) {
  const insets = useSafeAreaInsets();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      onTypingChange?.(false);
    };
  }, []);

  const handleChange = (text: string) => {
    onChange(text);
    if (!onTypingChange) return;
    onTypingChange(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onTypingChange(false), 1500);
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <TextInput
        style={styles.input}
        placeholder="Message..."
        placeholderTextColor="#aaa"
        value={value}
        onChangeText={handleChange}
        onSubmitEditing={onSend}
        returnKeyType="send"
        multiline
      />
      <TouchableOpacity
        style={[styles.sendBtn, (!value.trim() || sending) && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!value.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Ionicons name="send" size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#f7f7f9",
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.35 },
});

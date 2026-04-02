import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useImagePicker } from "@/src/hooks/useImagePicker";

import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { RegisterInput, registerUser } from "@/src/services/auth.services";
import { COLORS } from "@/src/constants/colors";

export default function RegisterScreen() {
  const [form, setForm] = useState<RegisterInput>({
    email: "",
    displayName: "",
    password: "",
    imageUri: null,
    gender:"Male",
  });
  const [hiddenNew, setHiddenNew] = useState(true);
  const [hiddenConfirm, setHiddenConfirm] = useState(true);

  const [loading, setLoading] = useState(false);
  const { imageUri, openImageOptions } = useImagePicker();
  const setField = (key: keyof RegisterInput, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const validateForm = (): string | null => {
    const email = form.email.trim();
    if (!email.includes("@")) return "Enter a valid email address.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleRegister = async () => {
    const err = validateForm();
    if (err) return Alert.alert("Invalid input", err);

    try {
      setLoading(true);
      await registerUser({ ...form, imageUri });
      router.replace("/tabs");
    } catch (e: any) {
      Alert.alert("Register failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
  <KeyboardAvoidingView behavior="padding">
    <ScrollView keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={openImageOptions}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.avatar} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="camera" size={28} color="#999" />
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <TextInput
        value={form.displayName}
        onChangeText={(v) => setField("displayName", v)}
        placeholder="Username"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        value={form.email}
        onChangeText={(v) => setField("email", v)}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        style={styles.input}
      />
      <View>
        <TextInput
          value={form.password}
          onChangeText={(v) => setField("password", v)}
          placeholder="Password"
          secureTextEntry={hiddenNew}
          textContentType="newPassword"
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setHiddenNew(!hiddenNew)}
        >
          <Ionicons
            name={hiddenNew ? "eye-off" : "eye"}
            size={22}
            color="#555"
          />
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          value={form.confirmPassword}
          onChangeText={(v) => setField("confirmPassword", v)}
          placeholder="Confirm password"
          autoCorrect={false}
          secureTextEntry={hiddenConfirm}
          textContentType="password"
          style={styles.input}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setHiddenConfirm(!hiddenConfirm)}
        >
          <Ionicons
            name={hiddenConfirm ? "eye-off" : "eye"}
            size={22}
            color="#555"
          />
        </TouchableOpacity>{" "}
      </View>
      <View style={styles.genderRow}>
        {(["Male", "Female"] as const).map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.genderBtn, form.gender === g && styles.genderBtnActive]}
            onPress={() => setForm((p) => ({ ...p, gender: g }))}
          >
            <Text style={[styles.genderText, form.gender === g && styles.genderTextActive]}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.primaryText}>Register</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondary}
        onPress={() => router.push("/auth/login")}
        disabled={loading}
      >
        <Text style={styles.primaryText}>Go Back</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, marginTop:50},
  title: { fontSize: 32, fontWeight: "700" },
  subtitle: { fontSize: 14, opacity: 0.7, marginTop: 6, marginBottom: 18 },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    position: "absolute",
    right: 15,
    margin: 10,
  },

  secondary: {
    backgroundColor: "rgb(62, 78, 110)",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    margin: 7,
  },
  buttonText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: COLORS.primary,
    margin: 7,
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "600" },

  linkBtn: { marginTop: 16, alignItems: "center" },
  linkText: { fontSize: 14, textDecorationLine: "underline" },
  avatarContainer: {
    width: 150,
    height: 150,
    borderRadius: 100,
    overflow: "hidden",
    marginBottom: 50,
    marginTop:50,
    backgroundColor: "#555",
    margin: "auto",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    marginTop: 6,
    fontSize: 12,
    color: "#777",
  },
  genderRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  genderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  genderBtnActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  genderText: { fontSize: 15, fontWeight: "600", color: "#555" },
  genderTextActive: { color: "#fff" },
});

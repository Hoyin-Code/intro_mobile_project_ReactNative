import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { registerUser } from "@/src/services/auth.services";

type RegisterPayload = {
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterScreen({
  onRegister,
  onGoToLogin,
}: {
  onRegister: (email: string, password: string) => Promise<void>;
  onGoToLogin?: () => void;
}) {
  const [form, setForm] = useState<RegisterPayload>({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });
  const [hidden, setHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  const setField = (key: keyof RegisterPayload, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const validate = (): string | null => {
    const email = form.email.trim();
    if (!email.includes("@")) return "Enter a valid email address.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword)
      return "Passwords do not match.";
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) return Alert.alert("Invalid input", err);

    try {
      setLoading(true);
      await registerUser(form);
    } catch (e: any) {
      Alert.alert("Register failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
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
          secureTextEntry={hidden}
          textContentType="newPassword"
          style={styles.input}
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setHidden(!hidden)}
        >
          <Ionicons name={hidden ? "eye-off" : "eye"} size={22} color="#555" />
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          value={form.confirmPassword}
          onChangeText={(v) => setField("confirmPassword", v)}
          placeholder="Confirm password"
          autoCorrect={false}
          secureTextEntry={hidden}
          textContentType="password"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setHidden(!hidden)}
        >
          <Ionicons name={hidden ? "eye-off" : "eye"} size={22} color="#555" />
        </TouchableOpacity>{" "}
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
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.primaryText}>Go Back</Text>
        )}
      </TouchableOpacity>

      {onGoToLogin && (
        <TouchableOpacity
          style={styles.linkBtn}
          onPress={onGoToLogin}
          disabled={loading}
        >
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
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
  },

  secondary: {
    backgroundColor: "#444",
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
    backgroundColor: "#111",
    margin: 7,
  },
  primaryText: { color: "white", fontSize: 16, fontWeight: "600" },

  linkBtn: { marginTop: 16, alignItems: "center" },
  linkText: { fontSize: 14, textDecorationLine: "underline" },
});

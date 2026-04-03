// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "@/src/hooks/useForm";
import PasswordInput from "@/src/components/PasswordInput";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen() {
  const { form, setField } = useForm({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync("email").then((v) => v && setField("email", v));
    SecureStore.getItemAsync("password").then(
      (v) => v && setField("password", v),
    );
  }, []);

  const validate = () => {
    if (!form.email.trim().includes("@")) return "Enter a valid email.";
    if (form.password.length < 6)
      return "Password must be at least 6 characters.";
    return null;
  };

  const handleLogin = async () => {
    const err = validate();
    if (err) return Alert.alert("Validation", err);

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      await SecureStore.setItemAsync("email", form.email.trim());
      await SecureStore.setItemAsync("password", form.password);
      router.replace("/tabs");
    } catch (e: any) {
      Alert.alert("Login failed", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/playtomic_logo.png")}
          style={{
            width: 300,
            height: 100,
            resizeMode: "contain",
            tintColor: "rgb(45, 33, 218)",
            gap: 100,
          }}
        />
        <Text style={styles.title}>Login</Text>

        <TextInput
          value={form.email}
          onChangeText={(v) => setField("email", v)}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          style={styles.input}
        />
        <PasswordInput
          value={form.password}
          onChangeText={(v) => setField("password", v)}
          placeholder="Password"
          textContentType="password"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondary]}
          onPress={() => router.replace("/auth/register")}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create account</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 18 },
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
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgb(45, 33, 218)",
  },
  secondary: {
    backgroundColor: "rgb(62, 78, 110)",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});

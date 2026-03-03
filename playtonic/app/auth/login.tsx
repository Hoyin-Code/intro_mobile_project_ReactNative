// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Image } from "react-native";
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync("email").then((v) => v && setEmail(v));
    SecureStore.getItemAsync("password").then((v) => v && setPassword(v));
  }, []);

  const validate = () => {
    const e = email.trim();
    if (!e.includes("@")) return "Enter a valid email.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleLogin = async () => {
    const err = validate();
    if (err) return Alert.alert("Validation", err);

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      await SecureStore.setItemAsync("email", email.trim());
      await SecureStore.setItemAsync("password", password);
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
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          style={styles.input}
        />
        <>
          <View>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={hidden}
              textContentType="password"
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.hidden}
              onPress={() => setHidden(!hidden)}
            >
              <Ionicons
                name={hidden ? "eye-off" : "eye"}
                size={22}
                color="#555"
              />
            </TouchableOpacity>
          </View>
        </>

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
  hidden: {
    position: "absolute",
    right: 15,
    margin: 10,
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

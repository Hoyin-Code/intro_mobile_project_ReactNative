// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase";
import { Route } from "expo-router/build/Route";
import { router } from "expo-router";
import { replace } from "expo-router/build/global-state/routing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { json } from "node:stream/consumers";
import { parseQueryParams } from "expo-router/build/fork/getStateFromPath-forks";
import { Image } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const storeUserEmail = async () => {
    await AsyncStorage.setItem("currentEmail", JSON.stringify(email));
  };
  const storeUserPass = async () => {
    await AsyncStorage.setItem("currentPass", JSON.stringify(password));
  };

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
      //store login credentials in async storage
      storeUserEmail();
      storeUserPass();

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

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          textContentType="password"
          style={styles.input}
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
          onPress={() => router.push("/auth/register")}
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
    backgroundColor: "rgb(62, 78, 110)45, 33, 218)",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
});

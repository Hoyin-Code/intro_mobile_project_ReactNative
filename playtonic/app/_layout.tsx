import { auth } from "@/firebase";
import { Stack } from "expo-router";
import { User, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {user ? <Stack.Screen name="tabs" /> : <Stack.Screen name="auth/login" />}
    </Stack>
  );
}

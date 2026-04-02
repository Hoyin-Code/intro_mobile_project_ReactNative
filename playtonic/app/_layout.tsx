import { auth, db } from "@/firebase";
import { UserContext, AppUserContext } from "@/src/models/appUserContext";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useState, useEffect, useRef } from "react";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AppUserContext | null>(null);
  const profileUnsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Reset user
      profileUnsubRef.current?.();
      profileUnsubRef.current = null;

      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      const docRef = doc(db(), "users", firebaseUser.uid);
      profileUnsubRef.current = onSnapshot(docRef, (snapshot) => {
        if (!snapshot.exists()) {
          setProfile(null);
        } else {
          const d = snapshot.data();
          setProfile({
            id: snapshot.id,
            displayName: String(d.displayName ?? ""),
            email: String(d.email ?? ""),
            isActive: Boolean(d.isActive ?? true),
            imageUrl: d.photoUrl ?? null,
            skillLevel: d.skillLevel,
            gender: d.gender,
            createdAt: d.createdAt
          });
        }
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      profileUnsubRef.current?.();
    };
  }, []);

  if (loading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <KeyboardProvider>
      <UserContext.Provider value={profile}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        >
          {user ? (
            <Stack.Screen name="tabs" />
          ) : (
            <Stack.Screen name="auth/login" />
          )}
        </Stack>
      </UserContext.Provider>
    </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

import { auth } from "@/firebase";
import { UserContext } from "@/src/models/appUserContext";
import { useImagePicker } from "@/src/hooks/useImagePicker";
import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useContext, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { uploadProfileImage } from "@/src/services/userService";

const RootLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const profile = useContext(UserContext);

  const { imageUri, openImageOptions } = useImagePicker(async (uri) => {
    if (!profile?.id) {
      Alert.alert("Error", "No user profile loaded.");
      return;
    }
    console.log(uri);
    await uploadProfileImage(profile.id, uri);
  });

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "rgb(45, 33, 218)" },
          headerTintColor: "#fff",
          headerTitle: () => (
            <Image
              source={require("../../assets/images/playtomic_logo.png")}
              style={{
                width: 200,
                height: 40,
                resizeMode: "center",
                tintColor: "white",
              }}
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setMenuOpen(true)}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="book" options={{ title: "Book" }} />
        <Tabs.Screen name="games" options={{ title: "Games" }} />
        <Tabs.Screen
          name="userinfo/reservations"
          options={{ href: null, title: "Reservations" }}
        />
        <Tabs.Screen
          name="userinfo/myMatches"
          options={{ href: null, title: "mymatches" }}
        />
      </Tabs>

      <Modal
        style={styles.background}
        visible={menuOpen}
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />

        <SafeAreaView style={styles.menuPage}>
          <View style={styles.menuHeader}>
            <TouchableOpacity
              onPress={() => setMenuOpen(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={25} color="#111" />
            </TouchableOpacity>
          </View>
          <View style={styles.section}>
            <Text style={styles.userInfo}>{profile?.displayName}</Text>
            <TouchableOpacity
              style={[styles.avatarContainer, { marginLeft: "auto" }]}
              onPress={openImageOptions}
            >
              {imageUri || profile?.imageUrl ? (
                <Image
                  source={{ uri: (imageUri ?? profile?.imageUrl) as string }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.placeholder}>
                  <Text style={styles.initials}>
                    {profile?.displayName
                      ?.split(" ")
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase())
                      .join("") ?? "?"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                router.push("/tabs/userinfo/myMatches");
                setMenuOpen(false);
              }}
            >
              <Ionicons name="tennisball-outline" size={20}></Ionicons>
              <Text>My Matches</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                router.push("/tabs/userinfo/reservations");
                setMenuOpen(false);
              }}
            >
              <Ionicons name="book-outline" size={20}></Ionicons>
              <Text>Reservations</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={async () => {
                setMenuOpen(false);
                await signOut(auth);
                router.replace("/auth/login");
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#111" />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    width: "90%",
    margin: "auto",
    backgroundColor: "#ebe4e4",
    borderRadius: 15,
  },
  userInfo: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111",
    flexShrink: 1,
  },
  background: {
    opacity: 0.1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menuPage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#fff",
  },
  menuHeader: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  closeBtn: {
    padding: 6,
  },
  menuContent: {
    padding: 16,
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  dangerItem: {
    backgroundColor: "#fff5f5",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#ddd",
    flexShrink: 0,
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
  initials: {
    fontSize: 22,
    fontWeight: "700",
    color: "#555",
  },
});

export default RootLayout;

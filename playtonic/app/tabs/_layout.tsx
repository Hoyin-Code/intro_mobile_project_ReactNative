import { auth } from "@/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Background } from "@react-navigation/elements";
import { router, Stack, Tabs, useNavigation } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { Image } from "react-native";
import { Menu } from "react-native-paper";

const RootLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <Text style={styles.menuTitle}>Menu</Text>

            <TouchableOpacity
              onPress={() => setMenuOpen(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={26} color="#111" />
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
});
export default RootLayout;

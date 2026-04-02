import { COLORS } from "@/src/constants/colors";
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
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: "Games",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="tennisball-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: "Chats",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="userinfo/reservations"
          options={{ href: null, title: "Reservations" }}
        />
        <Tabs.Screen
          name="userinfo/myMatches"
          options={{ href: null, title: "mymatches" }}
        />
        <Tabs.Screen
          name="components/ChatCard"
          options={{ href: null, title: "ChatCard" }}
        />
        <Tabs.Screen
          name="components/MatchCard"
          options={{ href: null, title: "MatchCard" }}
        />
                <Tabs.Screen
          name="components/FilterModal"
          options={{ href: null, title: "FilterModal" }}
        />
      </Tabs>

      <Modal
        visible={menuOpen}
        animationType="slide"
        onRequestClose={() => setMenuOpen(false)}
      >
        <SafeAreaView style={styles.menuPage}>
          {/* Header */}
          <View style={styles.menuHeader}>
            <TouchableOpacity
              onPress={() => setMenuOpen(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={22} color="#111" />
            </TouchableOpacity>
          </View>

          {/* Profile */}
          <View style={styles.profileRow}>
            <TouchableOpacity
              style={styles.avatarContainer}
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
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={11} color="#fff" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.displayName}</Text>
              <Text style={styles.profileSub}>Tap photo to change</Text>
            </View>
          </View>

          {/* Menu items */}
          <View style={styles.menuGroup}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push("/tabs/userinfo/myMatches");
                setMenuOpen(false);
              }}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="tennisball-outline" size={20} color="#555" />
              </View>
              <Text style={styles.menuItemText}>My Matches</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#ccc"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                router.push("/tabs/userinfo/reservations");
                setMenuOpen(false);
              }}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="calendar-outline" size={20} color="#555" />
              </View>
              <Text style={styles.menuItemText}>My Reservations</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#ccc"
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.menuGroup, { marginTop: 12 }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                setMenuOpen(false);
                await signOut(auth);
                router.replace("/auth/login");
              }}
            >
              <View style={[styles.menuIcon, styles.menuIconDanger]}>
                <Ionicons name="log-out-outline" size={20} color="#e53935" />
              </View>
              <Text style={styles.menuItemDanger}>Log out</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  menuPage: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  menuHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 28,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    flexShrink: 0,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#e8e8e8",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  profileSub: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  menuGroup: {
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#ebebeb",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconDanger: {
    backgroundColor: "#fdecea",
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  menuItemDanger: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e53935",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e0e0e0",
    marginLeft: 68,
  },
  initials: {
    fontSize: 22,
    fontWeight: "700",
    color: "#555",
  },
});

export default RootLayout;

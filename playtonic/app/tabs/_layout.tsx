import { Stack, Tabs } from "expo-router";

const RootLayout = () => {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="book" options={{ title: "Book" }} />
      <Tabs.Screen name="games" options={{ title: "Games" }} />
    </Tabs>
  );
};

export default RootLayout;

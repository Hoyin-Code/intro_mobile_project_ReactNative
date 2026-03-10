import { UserContext } from "@/src/models/appUserContext";
import { useContext } from "react";
import { Text, View } from "react-native";

const Chatlist = () => {
  const user = useContext(UserContext);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Chats Works!</Text>
    </View>
  );
};

export default Chatlist;

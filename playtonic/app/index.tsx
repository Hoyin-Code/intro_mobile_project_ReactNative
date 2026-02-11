import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

const Index = () => {
  return (
    <View 
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href={"/games"} asChild> 
        <Button title="games" color="cyan" disabled={false} onPress={() => {alert("Pressed!");}} />
      </Link>
    </View>
  );
}

export default Index;
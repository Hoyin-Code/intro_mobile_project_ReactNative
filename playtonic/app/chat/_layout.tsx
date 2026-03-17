import { Stack, useLocalSearchParams } from "expo-router";
import ChatHeader from "./components/ChatHeader";

export default function ChatLayout() {
  const { matchId, matchName } = useLocalSearchParams<{
    matchId: string;
    matchName: string;
  }>();

  return (
    <Stack
      screenOptions={{
        header: () => (
          <ChatHeader
            matchId={matchId!}
            matchName={matchName ?? "Match Chat"}
          />
        ),
      }}
    />
  );
}

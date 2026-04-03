import { COLORS } from "@/src/constants/colors";
import { useChat, ListItem } from "@/src/hooks/useChat";
import { useCallback } from "react";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import EmptyState from "@/src/components/EmptyState";

import ChatInput from "./components/ChatInput";
import MessageBubble from "./components/MessageBubble";

export default function ChatRoom() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user, loading, items, text, setText, sending, typingLabel, onSend, onTypingChange } =
    useChat(matchId);

  const keyExtractor = useCallback(
    (item: ListItem) => (item.type === "date" ? item.key : item.msg.id),
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "date") {
        return (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateLabel}>{item.label}</Text>
            <View style={styles.dateLine} />
          </View>
        );
      }
      return (
        <MessageBubble
          msg={item.msg}
          isMe={item.msg.senderId === user?.id}
          isFirst={item.isFirst}
          isLast={item.isLast}
        />
      );
    },
    [user?.id],
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={"height"}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          inverted={true}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.messageList}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <EmptyState
                icon="chatbubbles-outline"
                title="No messages yet"
                subtitle="Be the first to say something!"
              />
            </View>
          }
        />
      )}
      {typingLabel ? (
        <Text style={styles.typingLabel}>{typingLabel}</Text>
      ) : null}
      <ChatInput
        value={text}
        onChange={setText}
        onSend={onSend}
        sending={sending}
        onTypingChange={onTypingChange}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  messageList: { flex: 1 },
  list: { padding: 12, paddingBottom: 8 },
  dateSeparator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    gap: 8,
  },
  dateLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#ccc",
  },
  dateLabel: { fontSize: 12, color: "#999", fontWeight: "600" },
  emptyWrapper: { flex: 1, margin: "auto", paddingBottom: 400 },
  typingLabel: {
    fontSize: 12,
    alignSelf: "flex-end",
    color: "#999",
    fontStyle: "italic",
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "#f0f2f5",
  },
});

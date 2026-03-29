import { COLORS } from "@/src/constants/colors";
import { UserContext } from "@/src/models/appUserContext";
import { RTDBMessage } from "@/src/models/chat.model";
import { sendMessage, setTyping } from "@/src/services/chat.service";
import { rtdb } from "@/firebase";
import { onValue, ref } from "firebase/database";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHeaderHeight } from "@react-navigation/elements";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import EmptyState from "@/src/components/EmptyState";
import { formatDateLabel } from "@/src/utils/dateUtils";

import ChatInput from "./components/ChatInput";
import MessageBubble from "./components/MessageBubble";

type ListItem =
  | { type: "date"; label: string; key: string }
  | { type: "message"; msg: RTDBMessage; isFirst: boolean; isLast: boolean };


function buildListItems(messages: RTDBMessage[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = "";
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const dateLabel = formatDateLabel(msg.createdAt);
    if (dateLabel !== lastDate) {
      items.push({
        type: "date",
        label: dateLabel,
        key: `date-${msg.createdAt}`,
      });
      lastDate = dateLabel;
    }
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const isFirst =
      !prev ||
      prev.senderId !== msg.senderId ||
      formatDateLabel(prev.createdAt) !== dateLabel;
    const isLast =
      !next ||
      next.senderId !== msg.senderId ||
      formatDateLabel(next.createdAt) !== formatDateLabel(msg.createdAt);
    items.push({ type: "message", msg, isFirst, isLast });
  }
  return items;
}

export default function ChatRoom() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const headerHeight = useHeaderHeight();
  const user = useContext(UserContext);
  const [messages, setMessages] = useState<RTDBMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingLabel, setTypingLabel] = useState("");

  useEffect(() => {
    if (!matchId) return;
    return onValue(ref(rtdb, `chats/${matchId}/typing`), (snap) => {
      const data = snap.val() as Record<string, string> | null;
      if (!data) {
        setTypingLabel("");
        return;
      }
      const names = Object.entries(data)
        .filter(([id]) => id !== user?.id)
        .map(([, name]) => name);
      if (names.length === 0) setTypingLabel("");
      else if (names.length === 1) setTypingLabel(`${names[0]} is typing…`);
      else if (names.length === 2)
        setTypingLabel(`${names[0]} and ${names[1]} are typing…`);
      else setTypingLabel("Several people are typing…");
    });
  }, [matchId, user?.id]);

  useEffect(() => {
    if (!matchId) return;
    return onValue(ref(rtdb, `chats/${matchId}/messages`), (snap) => {
      const data = snap.val() as Record<string, Omit<RTDBMessage, "id">> | null;
      setMessages(
        data
          ? Object.entries(data)
              .map(([id, msg]) => ({ id, ...msg }))
              .sort((a, b) => a.createdAt - b.createdAt)
          : [],
      );
      setLoading(false);
    });
  }, [matchId]);

  const onSend = useCallback(async () => {
    if (!text.trim() || !user || !matchId) return;
    setSending(true);
    const draft = text.trim();
    setText("");
    try {
      await sendMessage(matchId, {
        senderId: user.id,
        senderName: user.displayName,
        senderImageUrl: user.imageUrl ?? null,
        text: draft,
      });
    } catch {
      setText(draft);
    } finally {
      setSending(false);
    }
  }, [text, user, matchId]);

  // Reversed so the inverted FlatList renders newest at the bottom
  const items = useMemo(
    () => [...buildListItems(messages)].reverse(),
    [messages],
  );

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
          inverted = {true}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          style={styles.messageList}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              <EmptyState icon="chatbubbles-outline" title="No messages yet" subtitle="Be the first to say something!" />
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
        onTypingChange={(isTyping) =>
          user &&
          matchId &&
          setTyping(matchId, user.id, isTyping ? user.displayName : null)
        }
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
  emptyWrapper: {flex:1, margin:"auto",paddingBottom:400},
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

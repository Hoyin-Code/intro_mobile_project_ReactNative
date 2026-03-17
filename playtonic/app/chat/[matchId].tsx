import { UserContext } from "@/src/models/appUserContext";
import { RTDBMessage } from "@/src/models/chat.model";
import { sendMessage } from "@/src/services/chat.service";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { rtdb } from "@/firebase";
import { onValue, ref } from "firebase/database";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ACCENT = "rgb(111, 161, 226)";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

type ListItem =
  | { type: "date"; label: string; key: string }
  | { type: "message"; msg: RTDBMessage; isFirst: boolean; isLast: boolean };

function buildListItems(messages: RTDBMessage[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate = "";
  messages.forEach((msg, i) => {
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
  });
  return items;
}

export default function ChatRoom() {
  const { matchId, matchName } = useLocalSearchParams<{
    matchId: string;
    matchName: string;
  }>();
  const user = useContext(UserContext);

  const [messages, setMessages] = useState<RTDBMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!matchId) return;
    const unsub = onValue(ref(rtdb, `chats/${matchId}/messages`), (snap) => {
      const data = snap.val() as Record<string, Omit<RTDBMessage, "id">> | null;
      if (!data) {
        setMessages([]);
      } else {
        const parsed = Object.entries(data)
          .map(([id, msg]) => ({ id, ...msg }))
          .sort((a, b) => a.createdAt - b.createdAt);
        setMessages(parsed);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [matchId]);

  const onSend = async () => {
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
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setText(draft);
    } finally {
      setSending(false);
    }
  };

  const items = buildListItems(messages);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateSeparator}>
          <View style={styles.dateLine} />
          <Text style={styles.dateLabel}>{item.label}</Text>
          <View style={styles.dateLine} />
        </View>
      );
    }

    const { msg, isFirst, isLast } = item;
    const isMe = msg.senderId === user?.id;

    return (
      <View
        style={[
          styles.msgRow,
          isMe ? styles.msgRowMe : styles.msgRowThem,
          !isLast && styles.msgCollapsed,
        ]}
      >
        {!isMe && (
          <View style={styles.avatarCol}>
            {isLast ? (
              msg.senderImageUrl ? (
                <Image
                  source={{ uri: msg.senderImageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {msg.senderName?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </View>
              )
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        <View style={[styles.bubbleCol, isMe && styles.bubbleColMe]}>
          {!isMe && isFirst && (
            <Text style={styles.senderName}>{msg.senderName}</Text>
          )}
          <View
            style={[
              styles.bubble,
              isMe ? styles.bubbleMe : styles.bubbleThem,
              isMe
                ? isFirst && isLast
                  ? styles.bubbleMeRound
                  : isFirst
                    ? styles.bubbleMeFirst
                    : isLast
                      ? styles.bubbleMeLast
                      : styles.bubbleMeMid
                : isFirst && isLast
                  ? styles.bubbleThemRound
                  : isFirst
                    ? styles.bubbleThemFirst
                    : isLast
                      ? styles.bubbleThemLast
                      : styles.bubbleThemMid,
            ]}
          >
            <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
              {msg.text}
            </Text>
          </View>
          {isLast && (
            <Text style={[styles.timestamp, isMe && styles.timestampMe]}>
              {formatTime(msg.createdAt)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {matchName ?? "Match Chat"}
          </Text>
          <Text style={styles.headerSub}>{messages.length} messages</Text>
        </View>
        <TouchableOpacity
          style={styles.infoBtn}
          onPress={() =>
            router.push({
              pathname: "/match/[matchId]",
              params: { matchId: matchId! },
            })
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={ACCENT}
          />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={ACCENT} size="large" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) =>
            item.type === "date" ? item.key : item.msg.id
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={48} color="#ddd" />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySub}>
                Be the first to say something!
              </Text>
            </View>
          }
        />
      )}

      {/* Input bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="#aaa"
            value={text}
            onChangeText={setText}
            onSubmitEditing={onSend}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!text.trim() || sending) && styles.sendBtnDisabled,
            ]}
            onPress={onSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const RADIUS = 18;
const RADIUS_SMALL = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f2f5" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
    gap: 8,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#111" },
  headerSub: { fontSize: 12, color: "#999", marginTop: 1 },
  infoBtn: { padding: 4 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

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

  msgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 2,
    gap: 6,
  },
  msgRowMe: { justifyContent: "flex-end" },
  msgRowThem: { justifyContent: "flex-start" },
  msgCollapsed: { marginBottom: 1 },

  avatarCol: { width: 32, justifyContent: "flex-end" },
  avatarSpacer: { width: 32 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: { fontSize: 13, fontWeight: "700", color: "#fff" },

  bubbleCol: { maxWidth: "72%", gap: 2 },
  bubbleColMe: { alignItems: "flex-end" },

  senderName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888",
    marginLeft: 4,
    marginBottom: 1,
  },

  bubble: { paddingHorizontal: 14, paddingVertical: 9 },

  bubbleMe: { backgroundColor: ACCENT },
  bubbleMeRound: { borderRadius: RADIUS },
  bubbleMeFirst: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS_SMALL,
  },
  bubbleMeMid: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS_SMALL,
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS_SMALL,
  },
  bubbleMeLast: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS_SMALL,
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
  },

  bubbleThem: { backgroundColor: "#fff" },
  bubbleThemRound: { borderRadius: RADIUS },
  bubbleThemFirst: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
    borderBottomLeftRadius: RADIUS_SMALL,
    borderBottomRightRadius: RADIUS,
  },
  bubbleThemMid: {
    borderTopLeftRadius: RADIUS_SMALL,
    borderTopRightRadius: RADIUS,
    borderBottomLeftRadius: RADIUS_SMALL,
    borderBottomRightRadius: RADIUS,
  },
  bubbleThemLast: {
    borderTopLeftRadius: RADIUS_SMALL,
    borderTopRightRadius: RADIUS,
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
  },

  bubbleText: { fontSize: 15, color: "#111", lineHeight: 21 },
  bubbleTextMe: { color: "#fff" },

  timestamp: { fontSize: 10, color: "#aaa", marginLeft: 4 },
  timestampMe: { marginLeft: 0, marginRight: 4 },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#bbb" },
  emptySub: { fontSize: 13, color: "#ccc" },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#f7f7f9",
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.35 },
});

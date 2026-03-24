import { RTDBMessage } from "@/src/models/chat.model";
import { Image, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/src/constants/colors";
const RADIUS = 18;
const RADIUS_SMALL = 4;

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  msg: RTDBMessage;
  isMe: boolean;
  isFirst: boolean;
  isLast: boolean;
};

export default function MessageBubble({ msg, isMe, isFirst, isLast }: Props) {
  const bubbleShape = isMe
    ? isFirst && isLast ? styles.bubbleMeRound
    : isFirst ? styles.bubbleMeFirst
    : isLast  ? styles.bubbleMeLast
    :            styles.bubbleMeMid
    : isFirst && isLast ? styles.bubbleThemRound
    : isFirst ? styles.bubbleThemFirst
    : isLast  ? styles.bubbleThemLast
    :            styles.bubbleThemMid;

  return (
    <View style={[styles.row, isMe ? styles.rowMe : styles.rowThem, !isLast && styles.collapsed]}>
      {/* Avatar (others only) */}
      {!isMe && (
        <View style={styles.avatarCol}>
          {isLast ? (
            msg.senderImageUrl ? (
              <Image source={{ uri: msg.senderImageUrl }} style={styles.avatar} />
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

      {/* Bubble + timestamp */}
      <View style={[styles.bubbleCol, isMe && styles.bubbleColMe]}>
        {!isMe && isFirst && (
          <Text style={styles.senderName}>{msg.senderName}</Text>
        )}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem, bubbleShape]}>
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
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", marginBottom: 2, gap: 6 },
  rowMe: { justifyContent: "flex-end" },
  rowThem: { justifyContent: "flex-start" },
  collapsed: { marginBottom: 1 },

  avatarCol: { width: 32, justifyContent: "flex-end" },
  avatarSpacer: { width: 32 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  avatarFallback: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.accent, justifyContent: "center", alignItems: "center",
  },
  avatarInitial: { fontSize: 13, fontWeight: "700", color: "#fff" },

  bubbleCol: { maxWidth: "72%", gap: 2 },
  bubbleColMe: { alignItems: "flex-end" },

  senderName: { fontSize: 11, fontWeight: "700", color: "#888", marginLeft: 4, marginBottom: 1 },

  bubble: { paddingHorizontal: 14, paddingVertical: 9 },
  bubbleMe: { backgroundColor: COLORS.accent },
  bubbleThem: { backgroundColor: "#fff" },

  bubbleMeRound:  { borderRadius: RADIUS },
  bubbleMeFirst:  { borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS, borderBottomLeftRadius: RADIUS, borderBottomRightRadius: RADIUS_SMALL },
  bubbleMeMid:    { borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS_SMALL, borderBottomLeftRadius: RADIUS, borderBottomRightRadius: RADIUS_SMALL },
  bubbleMeLast:   { borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS_SMALL, borderBottomLeftRadius: RADIUS, borderBottomRightRadius: RADIUS },

  bubbleThemRound: { borderRadius: RADIUS },
  bubbleThemFirst: { borderTopLeftRadius: RADIUS, borderTopRightRadius: RADIUS, borderBottomLeftRadius: RADIUS_SMALL, borderBottomRightRadius: RADIUS },
  bubbleThemMid:   { borderTopLeftRadius: RADIUS_SMALL, borderTopRightRadius: RADIUS, borderBottomLeftRadius: RADIUS_SMALL, borderBottomRightRadius: RADIUS },
  bubbleThemLast:  { borderTopLeftRadius: RADIUS_SMALL, borderTopRightRadius: RADIUS, borderBottomLeftRadius: RADIUS, borderBottomRightRadius: RADIUS },

  bubbleText: { fontSize: 15, color: "#111", lineHeight: 21 },
  bubbleTextMe: { color: "#fff" },

  timestamp: { fontSize: 10, color: "#aaa", marginLeft: 4 },
  timestampMe: { marginLeft: 0, marginRight: 4 },
});

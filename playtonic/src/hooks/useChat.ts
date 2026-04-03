import { UserContext } from "@/src/models/appUserContext";
import { RTDBMessage } from "@/src/models/chat.model";
import { sendMessage, setTyping } from "@/src/services/chat.service";
import { rtdb } from "@/firebase";
import { onValue, ref } from "firebase/database";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { formatDateLabel } from "@/src/utils/dateUtils";

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
      items.push({ type: "date", label: dateLabel, key: `date-${msg.createdAt}` });
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

export function useChat(matchId: string | undefined) {
  const user = useContext(UserContext);
  const [messages, setMessages] = useState<RTDBMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [typingLabel, setTypingLabel] = useState("");

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

  useEffect(() => {
    if (!matchId) return;
    return onValue(ref(rtdb, `chats/${matchId}/typing`), (snap) => {
      const data = snap.val() as Record<string, string> | null;
      if (!data) { setTypingLabel(""); return; }
      const names = Object.entries(data)
        .filter(([id]) => id !== user?.id)
        .map(([, name]) => name);
      if (names.length === 0) setTypingLabel("");
      else if (names.length === 1) setTypingLabel(`${names[0]} is typing…`);
      else if (names.length === 2) setTypingLabel(`${names[0]} and ${names[1]} are typing…`);
      else setTypingLabel("Several people are typing…");
    });
  }, [matchId, user?.id]);

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

  const onTypingChange = useCallback(
    (isTyping: boolean) => {
      if (user && matchId)
        setTyping(matchId, user.id, isTyping ? user.displayName : null);
    },
    [user, matchId],
  );

  // Reversed so the inverted FlatList renders newest at the bottom
  const items = useMemo(() => [...buildListItems(messages)].reverse(), [messages]);

  return {
    user,
    loading,
    items,
    text,
    setText,
    sending,
    typingLabel,
    onSend,
    onTypingChange,
  };
}

export type { ListItem };

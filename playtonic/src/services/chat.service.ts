import { rtdb } from "@/firebase";
import { RTDBChat, RTDBMessageData } from "@/src/models/chat.model";
import { push, ref, serverTimestamp, set } from "firebase/database";

export async function createMatchChat(matchId: string): Promise<void> {
  const chat: Omit<RTDBChat, "messages" | "typing"> & { createdAt: object } = {
    createdAt: serverTimestamp(),
  };
  await set(ref(rtdb, `chats/${matchId}`), chat);
}

export async function sendMessage(
  matchId: string,
  message: Omit<RTDBMessageData, "createdAt">,
): Promise<void> {
  const data: RTDBMessageData = { ...message, createdAt: serverTimestamp() as unknown as number };
  await push(ref(rtdb, `chats/${matchId}/messages`), data);
}

export interface RTDBMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderImageUrl: string | null;
  text: string;
  createdAt: number; // Unix timestamp
}

export interface RTDBChat {
  messages: Record<string, Omit<RTDBMessage, "id">>;
  typing: Record<string, boolean>; // { [userId]: true }
}

// presence/{matchId}/{userId}: true
// Indicates which users are currently active in a match chat
export type RTDBPresence = Record<string, Record<string, boolean>>;

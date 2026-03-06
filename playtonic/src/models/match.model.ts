export type MatchStatus = "open" | "full" | "cancelled" | "completed";
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "any";

export interface FSMatch {
  id: string;
  reservationId: string;
  courtId: string;
  venueId: string;
  hostId: string; // userId
  date: number; // Unix timestamp
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  skillLevel: SkillLevel;
  maxPlayers: number;
  players: string[]; // array of userIds
  status: MatchStatus;
  description: string | null;
  createdAt: number;
}

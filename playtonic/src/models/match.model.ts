export type MatchStatus = "open" | "full" | "cancelled" | "completed";

/** Numeric skill rating on a 0.5–7.0 scale (e.g. DUPR-style). */
export type SkillRating = number;

export const MIN_SKILL = 0.5;
export const MAX_SKILL = 7.0;
export const SKILL_STEP = 0.5;
export const MAX_PLAYERS = 4;

export interface FSMatch {
  id: string;
  reservationId: string;
  matchName: string;
  courtId: string;
  venueId: string;
  hostId: string; // userId
  date: number; // Unix timestamp
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  minSkillLevel: SkillRating;
  maxSkillLevel: SkillRating;
  maxPlayers: number;
  players: string[]; // array of userIds in the match
  status: MatchStatus;
  description: string | null;
  createdAt: number;
}

import { AppUserContext } from "./appUserContext";

export type MatchStatus =
  | "open"
  | "full"
  | "ongoing"
  | "cancelled"
  | "completed";

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
  competitive: boolean;
  cancelled: boolean;
  description: string | null;
  createdAt: number;
  results?: Results | null;
  mixedTeams: boolean;
  hostGender: "Male" | "Female";
}
export interface GameScore {
  team1: number;
  team2: number;
  winner: "team1" | "team2" | "draw";
}

export interface Results {
  team1: AppUserContext[];
  team2: AppUserContext[];
  games: GameScore[];
  winner: "team1" | "team2" | "draw";
  ratingDeltas: Record<string, number>;
  submittedAt: number;
}

export function getTotals(results: Results): { team1: number; team2: number } {
  return results.games.reduce(
    (acc, g) => ({ team1: acc.team1 + g.team1, team2: acc.team2 + g.team2 }),
    { team1: 0, team2: 0 },
  );
}

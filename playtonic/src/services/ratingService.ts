import { collection, doc, updateDoc } from "firebase/firestore";

import { db } from "@/firebase";
import { AppUserContext } from "../models/appUserContext";
import { MAX_SKILL, MIN_SKILL } from "../models/match.model";

const K = 0.5; // max rating change per game

function avgSkill(players: AppUserContext[]): number {
  return players.reduce((s, p) => s + p.skillLevel, 0) / players.length;
}

export function computeRatingDeltas(
  team1: AppUserContext[],
  team2: AppUserContext[],
  scoreTeam1: number,
  scoreTeam2: number,
): Record<string, number> {
  if (team1.length === 0 || team2.length === 0) return {};
  const avg1 = avgSkill(team1);
  const avg2 = avgSkill(team2);
  const expected1 = 1 / (1 + Math.pow(10, (avg2 - avg1) / 2));
  const expected2 = 1 - expected1;
  const score1 = scoreTeam1 > scoreTeam2 ? 1 : scoreTeam1 < scoreTeam2 ? 0 : 0.5;
  const score2 = 1 - score1;
  const deltas: Record<string, number> = {};
  team1.forEach((p) => { deltas[p.id] = K * (score1 - expected1); });
  team2.forEach((p) => { deltas[p.id] = K * (score2 - expected2); });
  return deltas;
}

export async function updateRatings(
  team1: AppUserContext[],
  team2: AppUserContext[],
  winner: "team1" | "team2" | "draw",
): Promise<void> {
  const avg1 = avgSkill(team1);
  const avg2 = avgSkill(team2);

  const expected1 = 1 / (1 + Math.pow(10, (avg2 - avg1) / 2));
  const expected2 = 1 - expected1;

  const score1 = winner === "team1" ? 1 : winner === "draw" ? 0.5 : 0;
  const score2 = 1 - score1;

  const usersCol = collection(db(), "users");

  const updates = [
    ...team1.map((p) => ({
      id: p.id,
      newSkill: Math.min(MAX_SKILL, Math.max(MIN_SKILL, p.skillLevel + K * (score1 - expected1))),
    })),
    ...team2.map((p) => ({
      id: p.id,
      newSkill: Math.min(MAX_SKILL, Math.max(MIN_SKILL, p.skillLevel + K * (score2 - expected2))),
    })),
  ];

  await Promise.all(
    updates.map(({ id, newSkill }) =>
      updateDoc(doc(usersCol, id), { skilllevel: newSkill }),
    ),
  );
}

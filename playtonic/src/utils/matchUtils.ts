import { FSMatch, MatchStatus } from "../models/match.model";

export function getEffectiveMatchStatus(match: FSMatch): MatchStatus {
  if (match.cancelled) return "cancelled";
  if (match.results) return "completed";
  const dateStr = new Date(match.date).toDateString();
  const now = Date.now();
  const start = new Date(`${dateStr} ${match.startTime}`).getTime();
  const end = new Date(`${dateStr} ${match.endTime}`).getTime();
  if (now >= end) return "completed";
  if (now >= start) return "ongoing";
  if (match.players.length >= match.maxPlayers) return "full";
  return "open";
}

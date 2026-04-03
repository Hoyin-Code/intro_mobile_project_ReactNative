import { FSMatch, MatchStatus } from "../models/match.model";

export function getEffectiveMatchStatus(match: FSMatch): MatchStatus {
  if (match.cancelled) return "cancelled";
  if (match.results) return "completed";
  const d = new Date(match.date);
  const now = Date.now();
  const [startH, startM] = match.startTime.split(":").map(Number);
  const [endH, endM] = match.endTime.split(":").map(Number);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), startH, startM).getTime();
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), endH, endM).getTime();
  if (now >= end) return "completed";
  if (now >= start) return "ongoing";
  if (match.players.length >= match.maxPlayers) return "full";
  return "open";
}

import { FSMatch } from "../models/match.model";

export function isMatchOngoing(match: FSMatch): boolean {
  const now = new Date();
  const day = new Date(match.date);
  const [startH, startM] = match.startTime.split(":").map(Number);
  const [endH, endM] = match.endTime.split(":").map(Number);
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), startH, startM);
  const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), endH, endM);
  return now >= start && now <= end;
}

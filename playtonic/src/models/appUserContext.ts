import { createContext } from "react";

export interface AppUserContext {
  id: string;
  displayName: string;
  email: string;
  isActive: boolean;
  imageUrl?: string | null;
  skillLevel: number;
  gender: "Male" | "Female";
  createdAt: number;
}
export const UserContext = createContext<AppUserContext | null>(null);

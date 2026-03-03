import { createContext } from "react";

export interface AppUserContext {
  id: string;
  displayName: string;
  email: string;
  isActive: boolean;
  imageUrl?: string | null;
}
export const UserContext = createContext<AppUserContext | null>(null);

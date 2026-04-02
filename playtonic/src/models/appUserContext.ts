import { createContext } from "react";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

export interface AppUserContext {
  id: string;
  displayName: string;
  email: string;
  isActive: boolean;
  imageUrl?: string | null;
  skillLevel: number;
  gender: "Male" | "Female"
  createdAt:unknown
}
export const UserContext = createContext<AppUserContext | null>(null);

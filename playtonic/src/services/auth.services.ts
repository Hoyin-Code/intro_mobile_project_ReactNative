// src/services/auth.service.ts
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
export type AppUserDoc = {
  email: string;
  displayName: string;
  createdAt: unknown;
  isActive: boolean;
};
export type RegisterInput = {
  email: string;
  password: string;
  displayName?: string;
};

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerUser(
  input: RegisterInput,
): Promise<UserCredential> {
  const email = cleanEmail(input.email);
  const password = input.password;

  if (!email.includes("@")) throw new Error("Invalid email address.");
  if (password.length < 6)
    throw new Error("Password must be at least 6 characters.");

  const cred = await createUserWithEmailAndPassword(auth, email, password);

  const displayName = (input.displayName ?? "").trim();
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }

  const userDoc: AppUserDoc = {
    email,
    displayName: displayName || (cred.user.displayName ?? ""),
    createdAt: serverTimestamp(),
    isActive: true,
  };

  await setDoc(doc(db(), "users", cred.user.uid), userDoc, { merge: true });

  return cred;
}

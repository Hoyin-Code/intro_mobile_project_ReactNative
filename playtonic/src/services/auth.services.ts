import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { uploadProfileImage } from "./userService";

export type AppUserDoc = {
  email: string;
  displayName: string;
  createdAt: unknown;
  isActive: boolean;
  photoUrl?: string;
  skillevel: number;
};

export type RegisterInput = {
  email: string;
  password: string;
  confirmPassword?: string;
  displayName: string;
  imageUri?: string | null;
};

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerUser(
  input: RegisterInput,
): Promise<UserCredential> {
  const email = cleanEmail(input.email);
  const { password, imageUri = null } = input;

  if (!email.includes("@")) throw new Error("Invalid email address.");
  if (password.length < 6)
    throw new Error("Password must be at least 6 characters.");
  //TODO: make displayname required or change to first or last name
  //TODO: fix register logic
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
    skillevel: 1.5,
  };
  await setDoc(doc(db(), "users", cred.user.uid), userDoc, { merge: true });

  if (imageUri) {
    await uploadProfileImage(cred.user.uid, imageUri);
  }

  return cred;
}

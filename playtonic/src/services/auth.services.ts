import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { uploadProfileImage } from "./userService";
export type RegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  imageUri?: string | null;
  gender: "Male" | "Female";
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
  const displayName = (input.displayName ?? "").trim();
  if (!displayName) throw new Error("Display name is required.");

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });

  const userDoc = {
    email,
    displayName,
    createdAt: serverTimestamp(),
    isActive: true,
    skillLevel: 1.5,
    gender: input.gender,
  };
  await setDoc(doc(db(), "users", cred.user.uid), userDoc, { merge: true });

  if (imageUri) {
    await uploadProfileImage(cred.user.uid, imageUri);
  }

  return cred;
}

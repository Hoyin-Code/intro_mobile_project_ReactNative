import { collection, doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "@/firebase";
import { AppUserContext } from "../models/appUserContext";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

const usersCol = () => collection(db(), "users");

export async function getUserById(uid: string): Promise<AppUserContext | null> {
  const docRef = doc(usersCol(), uid);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;
  const d = snapshot.data();

  return {
    id: snapshot.id,
    displayName: String(d.displayName ?? ""),
    email: String(d.email ?? ""),
    isActive: Boolean(d.isActive ?? true),
    imageUrl: d.photoUrl ?? null,
    skilllevel: Number(d.skilllevel ?? 1.0),
  };
}

export async function uploadProfileImage(
  uid: string,
  imageUri: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: `${uid}.jpg`,
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("public_id", `profile_photos/${uid}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);

  const data = await res.json();
  const photoUrl: string = data.secure_url;

  await setDoc(doc(usersCol(), uid), { photoUrl }, { merge: true });

  return photoUrl;
}

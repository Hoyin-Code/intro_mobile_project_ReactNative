import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export function useImagePicker(onPick?: (uri: string) => Promise<void> | void) {
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Keep onPick in a ref so callbacks never go stale
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const handleUri = useCallback(async (uri: string) => {
    setImageUri(uri);
    try {
      await onPickRef.current?.(uri);
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message ?? "Could not upload image.");
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) await handleUri(result.assets[0].uri);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not open gallery.");
    }
  }, [handleUri]);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera access is required.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) await handleUri(result.assets[0].uri);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Could not open camera.");
    }
  }, [handleUri]);

  const openImageOptions = useCallback(() => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: pickFromGallery },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [takePhoto, pickFromGallery]);

  return { imageUri, openImageOptions };
}

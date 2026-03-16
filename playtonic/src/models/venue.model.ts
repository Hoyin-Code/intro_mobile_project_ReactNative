import { Ionicons } from "@expo/vector-icons";

export interface FSCourt {
  id: string;
  name: string;
  isActive: boolean;
}

export interface FSVenue {
  id: string;
  name: string;
  address: string;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
  courts: FSCourt[];
  facilities: Facility[];
}

export type Facility = {
  id: string;
  name: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

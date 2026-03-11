import { Ionicons } from "@expo/vector-icons";

export type Facility = {
  id: string;
  name: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

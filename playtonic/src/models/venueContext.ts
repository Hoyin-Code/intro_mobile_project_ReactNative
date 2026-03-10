import { FSCourt, FSVenue } from "@/src/models/venue.model";
import { createContext } from "react";

export type VenueContextType = {
  venue: FSVenue | null;
  courts: FSCourt[];
  loading: boolean;
};

export const VenueContext = createContext<VenueContextType>({
  venue: null,
  courts: [],
  loading: true,
});

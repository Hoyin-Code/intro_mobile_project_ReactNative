export interface FSVenue {
  id: string;
  name: string;
  address: string;
  imageUrl: string | null;
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
}
// TODO: make courts nested in fsVenue not seperate collection
export interface FSCourt {
  id: string;
  venueId: string;
  name: string;
  isActive: boolean;
}

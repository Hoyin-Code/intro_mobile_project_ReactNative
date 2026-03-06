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
export interface FSCourt {
  id: string;
  venueId: string;
  name: string;
  isActive: boolean;
}

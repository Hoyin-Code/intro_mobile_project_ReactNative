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
  openTime: string;
  closeTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
  courts: FSCourt[];
}

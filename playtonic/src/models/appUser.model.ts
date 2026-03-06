export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  isActive: boolean;
  imageUrl: string | null;
}

export const MATCH_BADGE: Record<string, { label: string; color: string }> = {
  open: { label: "OPEN", color: "#e6f4ea" },
  full: { label: "FULL", color: "#fdecea" },
  ongoing: { label: "ONGOING", color: "#fff3cd" },
  completed: { label: "COMPLETED", color: "#e8eaf6" },
  cancelled: { label: "CANCELLED", color: "#f5f5f5" },
};

export const RESERVATION_BADGE: Record<
  string,
  { label: string; color: string }
> = {
  upcoming: { label: "Upcoming", color: "#e8f0fe" },
  ongoing: { label: "Ongoing", color: "#fff3cd" },
  completed: { label: "Completed", color: "#e8eaf6" },
  cancelled: { label: "Cancelled", color: "#f5f5f5" },
};

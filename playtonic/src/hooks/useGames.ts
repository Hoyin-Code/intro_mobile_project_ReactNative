import { FSMatch } from "@/src/models/match.model";
import { FSVenue } from "@/src/models/venue.model";
import { UserContext } from "@/src/models/appUserContext";
import { getOpenMatches } from "@/src/services/matchService";
import { getVenues } from "@/src/services/venueService";
import { useFocusedData } from "@/src/hooks/useFocusedData";
import { FilterState } from "@/app/tabs/components/FilterModal";
import { useCallback, useContext, useState } from "react";

export type EnrichedMatch = FSMatch & { venueName: string; courtName: string };

export const DEFAULT_FILTER: FilterState = {
  dates: new Set(),
  fromHour: 6,
  toHour: 22,
  minSkill: 0.5,
  maxSkill: 7.0,
  gender: "all",
};

function parseHour(time: string) {
  return parseInt(time.split(":")[0], 10);
}

export function isFilterActive(f: FilterState) {
  return (
    f.dates.size > 0 ||
    f.fromHour !== 6 ||
    f.toHour !== 22 ||
    f.minSkill !== 0.5 ||
    f.maxSkill !== 7.0 ||
    f.gender !== "all"
  );
}

export function useGames() {
  const user = useContext(UserContext);
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const loader = useCallback(async (): Promise<EnrichedMatch[]> => {
    const [raw, venues] = await Promise.all([getOpenMatches(), getVenues()]);
    const venueMap = new Map<string, FSVenue>(venues.map((v) => [v.id, v]));
    const enriched: EnrichedMatch[] = raw.map((m) => {
      const venue = venueMap.get(m.venueId);
      const court = venue?.courts.find((c) => c.id === m.courtId);
      return {
        ...m,
        venueName: venue?.name ?? "Unknown Venue",
        courtName: court?.name ?? "Unknown Court",
      };
    });
    enriched.sort((a, b) => a.date - b.date || a.startTime.localeCompare(b.startTime));
    return enriched;
  }, []);

  const { data, loading, refreshing, onRefresh } = useFocusedData(loader);
  const matches = data ?? [];

  const filtered = matches.filter((m) => {
    if (filter.dates.size > 0 && !filter.dates.has(new Date(m.date).toDateString())) return false;
    const hour = parseHour(m.startTime);
    if (hour < filter.fromHour || hour >= filter.toHour) return false;
    if (m.minSkillLevel > filter.maxSkill || m.maxSkillLevel < filter.minSkill) return false;
    if (filter.gender === "mixed" && !m.mixedTeams) return false;
    if (filter.gender === "same" && m.mixedTeams) return false;
    if (filter.gender === "same" && user && m.hostGender !== user.gender) return false;
    return true;
  });

  const openFilter = () => setFilterModalVisible(true);
  const closeFilter = () => setFilterModalVisible(false);
  const applyFilter = (f: FilterState) => {
    setFilter(f);
    setFilterModalVisible(false);
  };

  return {
    loading,
    refreshing,
    onRefresh,
    filtered,
    filter,
    filterModalVisible,
    openFilter,
    closeFilter,
    applyFilter,
  };
}

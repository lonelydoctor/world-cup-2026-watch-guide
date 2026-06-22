import { matches, teams, venues } from "@/lib/data";
import { isTonight, isWithinNextDays, localDateKey } from "@/lib/time";
import type { Match } from "@/lib/types";

export type MatchFilters = {
  dateRange?: string | null;
  city?: string | null;
  team?: string | null;
  round?: string | null;
  status?: string | null;
  timeZone?: string | null;
  now?: Date;
};

export function filterMatches(filters: MatchFilters = {}) {
  const timeZone = filters.timeZone || "America/Los_Angeles";
  const now = filters.now ?? new Date();
  const normalizedCity = filters.city?.toLowerCase().trim();
  const normalizedTeam = filters.team?.toLowerCase().trim();
  const normalizedRound = filters.round?.toLowerCase().trim();
  const normalizedStatus = filters.status?.toLowerCase().trim();

  return matches.filter((match) => {
    if (normalizedCity) {
      const venue = match.venue;
      const cityHit = [
        venue.city,
        venue.cityZh,
        venue.stadium,
        venue.fifaName,
        venue.id
      ].some((value) => value.toLowerCase().includes(normalizedCity));
      if (!cityHit) return false;
    }

    if (normalizedTeam) {
      const teamHit = [match.home, match.away].some((slot) => {
        if (slot.type !== "team") return slot.label.toLowerCase().includes(normalizedTeam);
        const team = teams.find((item) => item.code === slot.code);
        return [
          slot.name,
          slot.zhName,
          slot.code,
          ...(team?.aliases ?? [])
        ].some((value) => value.toLowerCase().includes(normalizedTeam));
      });
      if (!teamHit) return false;
    }

    if (normalizedRound && match.round.toLowerCase() !== normalizedRound) {
      if (!match.phase.toLowerCase().includes(normalizedRound)) return false;
    }

    if (normalizedStatus && normalizedStatus !== "all" && match.status !== normalizedStatus) {
      return false;
    }

    if (filters.dateRange === "today") {
      const today = localDateKey(now.toISOString(), timeZone);
      if (localDateKey(match.kickoffUtc, timeZone) !== today) return false;
    }

    if (filters.dateRange === "tonight" && !isTonight(match.kickoffUtc, timeZone, now)) {
      return false;
    }

    if (filters.dateRange === "next3" && !isWithinNextDays(match.kickoffUtc, 3, timeZone, now)) {
      return false;
    }

    if (filters.dateRange === "next7" && !isWithinNextDays(match.kickoffUtc, 7, timeZone, now)) {
      return false;
    }

    return true;
  });
}

export function groupByDate(items: Match[], timeZone = "America/Los_Angeles") {
  return items.reduce<Record<string, Match[]>>((acc, match) => {
    const key = localDateKey(match.kickoffUtc, timeZone);
    acc[key] ??= [];
    acc[key].push(match);
    return acc;
  }, {});
}

export function searchCity(query: string) {
  const q = query.toLowerCase();
  return venues.find((venue) =>
    [venue.city, venue.cityZh, venue.stadium, venue.fifaName].some((value) =>
      q.includes(value.toLowerCase()) || value.toLowerCase().includes(q)
    )
  );
}

export function searchTeam(query: string) {
  const q = query.toLowerCase();
  return teams.find((team) =>
    [team.name, team.zhName, team.shortName, team.code, ...team.aliases].some((value) =>
      q.includes(value.toLowerCase()) || value.toLowerCase().includes(q)
    )
  );
}

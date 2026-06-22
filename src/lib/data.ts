import generated from "@/data/worldcup.generated.json";
import overrides from "@/data/manual-overrides.json";
import { TEAM_META, VENUES } from "@/data/meta";
import type { Match, RawSlot, Slot, SourceAudit, Standing, Team, Venue } from "@/lib/types";

type RawMatch = Omit<Match, "home" | "away" | "venue"> & {
  home: RawSlot;
  away: RawSlot;
};

type GeneratedData = {
  generatedAt: string;
  source: string;
  sourceUrl: string;
  matches: RawMatch[];
  groups: Record<string, string[]>;
};

type Overrides = {
  updatedAt: string | null;
  scores: Record<string, { home: number; away: number; status?: Match["status"] }>;
  resolvedSlots: Record<string, string>;
};

const raw = generated as GeneratedData;
const manualOverrides = overrides as Overrides;

export const teams = TEAM_META;
export const venues = VENUES;

export const teamByName = new Map<string, Team>(
  teams.flatMap((team) => [
    [team.name.toLowerCase(), team],
    [team.zhName.toLowerCase(), team],
    ...team.aliases.map((alias) => [alias.toLowerCase(), team] as const)
  ])
);

export const teamByCode = new Map<string, Team>(
  teams.map((team) => [team.code, team])
);

export const venueById = new Map<string, Venue>(
  venues.map((venue) => [venue.id, venue])
);

function resolveSlot(slot: RawSlot): Slot {
  if (slot.type === "placeholder") {
    const resolvedCode = manualOverrides.resolvedSlots[slot.label];
    if (resolvedCode) {
      const resolvedTeam = teamByCode.get(resolvedCode);
      if (resolvedTeam) {
        return {
          type: "team",
          name: resolvedTeam.name,
          code: resolvedTeam.code,
          zhName: resolvedTeam.zhName,
          flagCode: resolvedTeam.flagCode
        };
      }
    }
    return slot;
  }

  const team = teamByName.get(slot.name.toLowerCase());
  if (!team) {
    return {
      type: "placeholder",
      label: slot.name,
      zhLabel: slot.name
    };
  }
  return {
    type: "team",
    name: team.name,
    code: team.code,
    zhName: team.zhName,
    flagCode: team.flagCode
  };
}

export const matches: Match[] = raw.matches.map((match) => {
  const override = manualOverrides.scores[String(match.matchNumber)] ?? manualOverrides.scores[match.id];
  const venue = venueById.get(match.venueId);
  return {
    ...match,
    venue:
      venue ??
      ({
        id: match.venueId,
        stadium: match.venueLabel.split(",")[0],
        fifaName: match.venueLabel.split(",")[0],
        city: match.venueLabel.split(",").at(1)?.trim() ?? "Unknown",
        cityZh: match.venueLabel.split(",").at(1)?.trim() ?? "未知城市",
        country: "United States",
        countryZh: "美国",
        region: "Central",
        timezone: "America/Chicago",
        lat: 0,
        lng: 0,
        capacity: 0,
        travelNote: "待补充场馆信息。"
      } satisfies Venue),
    home: resolveSlot(match.home),
    away: resolveSlot(match.away),
    score: override ? { home: override.home, away: override.away } : match.score,
    status: override?.status ?? match.status
  };
});

export const sourceAudit: SourceAudit = {
  generatedAt: raw.generatedAt,
  source: raw.source,
  sourceUrl: raw.sourceUrl,
  overrideUpdatedAt: manualOverrides.updatedAt
};

export function getTeam(codeOrName: string) {
  return teamByCode.get(codeOrName.toUpperCase()) ?? teamByName.get(codeOrName.toLowerCase());
}

export function matchesForTeam(team: Team) {
  return matches.filter(
    (match) =>
      (match.home.type === "team" && match.home.code === team.code) ||
      (match.away.type === "team" && match.away.code === team.code)
  );
}

export function matchesForVenue(venueId: string) {
  return matches.filter((match) => match.venueId === venueId);
}

export function displaySlot(slot: Slot) {
  return slot.type === "team" ? slot.zhName : slot.zhLabel;
}

export function slotFlagCode(slot: Slot) {
  return slot.type === "team" ? slot.flagCode : null;
}

export function computeStandings(group: string): Standing[] {
  const groupTeams = teams.filter((team) => team.group === group);
  const table = new Map<string, Standing>(
    groupTeams.map((team) => [
      team.code,
      {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }
    ])
  );

  for (const match of matches.filter((item) => item.group === group && item.score)) {
    if (match.home.type !== "team" || match.away.type !== "team" || !match.score) continue;
    const home = table.get(match.home.code);
    const away = table.get(match.away.code);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.score.home;
    home.goalsAgainst += match.score.away;
    away.goalsFor += match.score.away;
    away.goalsAgainst += match.score.home;

    if (match.score.home > match.score.away) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (match.score.home < match.score.away) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return Array.from(table.values())
    .map((standing) => ({
      ...standing,
      goalDifference: standing.goalsFor - standing.goalsAgainst
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        a.team.seed - b.team.seed
    );
}

export function nextMatches(limit = 6, now = new Date()) {
  return matches
    .filter((match) => new Date(match.kickoffUtc).getTime() >= now.getTime())
    .sort((a, b) => +new Date(a.kickoffUtc) - +new Date(b.kickoffUtc))
    .slice(0, limit);
}

export function finishedMatches(limit = 6) {
  return matches
    .filter((match) => match.status === "finished")
    .sort((a, b) => +new Date(b.kickoffUtc) - +new Date(a.kickoffUtc))
    .slice(0, limit);
}

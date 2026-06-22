export type Slot =
  | {
      type: "team";
      name: string;
      code: string;
      zhName: string;
      flagCode: string;
    }
  | {
      type: "placeholder";
      label: string;
      zhLabel: string;
    };

export type RawSlot =
  | {
      type: "team";
      name: string;
    }
  | {
      type: "placeholder";
      label: string;
      zhLabel: string;
    };

export type Team = {
  code: string;
  name: string;
  zhName: string;
  shortName: string;
  flagCode: string;
  group: string;
  confederation: string;
  seed: number;
  aliases: string[];
  spotlight: {
    headline: string;
    players: string[];
    note: string;
  };
};

export type Venue = {
  id: string;
  stadium: string;
  fifaName: string;
  city: string;
  cityZh: string;
  country: "Canada" | "Mexico" | "United States";
  countryZh: string;
  region: "Western" | "Central" | "Eastern";
  timezone: string;
  lat: number;
  lng: number;
  capacity: number;
  travelNote: string;
  imageUrl?: string;
};

export type MatchScore = {
  home: number;
  away: number;
};

export type Match = {
  id: string;
  matchNumber: number;
  phase: string;
  round: string;
  group: string | null;
  date: string;
  localTime: string;
  kickoffUtc: string;
  utcOffset: number;
  venueId: string;
  venueLabel: string;
  venue: Venue;
  home: Slot;
  away: Slot;
  status: "scheduled" | "live" | "finished";
  score: MatchScore | null;
};

export type Standing = {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type SourceAudit = {
  generatedAt: string;
  source: string;
  sourceUrl: string;
  overrideUpdatedAt: string | null;
};

export type ConciergeAnswer = {
  intent: "time" | "city" | "team" | "spotlight" | "general";
  title: string;
  summary: string;
  matches: Match[];
  suggestions: string[];
};

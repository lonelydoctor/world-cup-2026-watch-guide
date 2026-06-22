import type { RawSlot } from "@/lib/types";
import matchNumberMap from "@/data/match-number-map.json";

type RawParsedMatch = {
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
  home: RawSlot;
  away: RawSlot;
  status: "scheduled" | "live" | "finished";
  score: { home: number; away: number } | null;
};

const sectionLabels: Record<string, { round: string; group?: string; phase: string }> = {
  Group_A: { round: "Group stage", group: "A", phase: "小组赛" },
  Group_B: { round: "Group stage", group: "B", phase: "小组赛" },
  Group_C: { round: "Group stage", group: "C", phase: "小组赛" },
  Group_D: { round: "Group stage", group: "D", phase: "小组赛" },
  Group_E: { round: "Group stage", group: "E", phase: "小组赛" },
  Group_F: { round: "Group stage", group: "F", phase: "小组赛" },
  Group_G: { round: "Group stage", group: "G", phase: "小组赛" },
  Group_H: { round: "Group stage", group: "H", phase: "小组赛" },
  Group_I: { round: "Group stage", group: "I", phase: "小组赛" },
  Group_J: { round: "Group stage", group: "J", phase: "小组赛" },
  Group_K: { round: "Group stage", group: "K", phase: "小组赛" },
  Group_L: { round: "Group stage", group: "L", phase: "小组赛" },
  Round_of_32: { round: "Round of 32", phase: "32强" },
  Round_of_16: { round: "Round of 16", phase: "16强" },
  Quarterfinals: { round: "Quarterfinals", phase: "四分之一决赛" },
  Semifinals: { round: "Semifinals", phase: "半决赛" },
  Match_for_third_place: { round: "Third place", phase: "三四名决赛" },
  Final: { round: "Final", phase: "决赛" }
};

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " "
  };
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    )
    .replace(/&([a-zA-Z]+);/g, (_, name) => named[name] ?? `&${name};`);
}

function stripTags(value: string) {
  return decodeHtml(
    value
      .replace(/<style[\s\S]*?<\/style>/g, "")
      .replace(/<script[\s\S]*?<\/script>/g, "")
      .replace(/<[^>]*>/g, " ")
  )
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

function parseLocalTime(value: string) {
  const text = stripTags(value).replace("−", "-");
  const match = text.match(
    /(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)\s*UTC([+-]\d+)/
  );
  if (!match) throw new Error(`Unable to parse kickoff time: ${text}`);
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const isPm = match[3] === "p.m.";
  if (isPm && hours !== 12) hours += 12;
  if (!isPm && hours === 12) hours = 0;
  return { display: text, hours, minutes, offsetHours: Number(match[4]) };
}

function toUtcIso(date: string, parsedTime: ReturnType<typeof parseLocalTime>) {
  return new Date(
    Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 1,
      Number(date.slice(8, 10)),
      parsedTime.hours - parsedTime.offsetHours,
      parsedTime.minutes
    )
  ).toISOString();
}

function sectionIndex(html: string) {
  return Object.keys(sectionLabels)
    .map((id) => ({ id, index: html.indexOf(`id="${id}"`) }))
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index);
}

function sectionFor(
  sections: ReturnType<typeof sectionIndex>,
  index: number
) {
  let current = sections[0];
  for (const section of sections) {
    if (section.index > index) break;
    current = section;
  }
  return sectionLabels[current.id];
}

function slotFromName(name: string): RawSlot {
  if (/^(Winner|Runner-up|3rd|Loser)\s/.test(name)) {
    return {
      type: "placeholder",
      label: name,
      zhLabel: name
        .replace("Winner Group", "小组第1")
        .replace("Runner-up Group", "小组第2")
        .replace("Winner Match", "胜者 比赛")
        .replace("Loser Match", "负者 比赛")
        .replace("3rd Group", "最佳第三名")
    };
  }
  return { type: "team", name };
}

function venueIdFromLabel(label: string) {
  return label
    .split(",")[0]
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseScore(text: string) {
  const match = text.replace("–", "-").match(/^(\d+)\s*-\s*(\d+)/);
  return match ? { home: Number(match[1]), away: Number(match[2]) } : null;
}

function resolveMatchNumber({
  scoreText,
  date,
  venueId,
  homeName,
  awayName,
  fallback
}: {
  scoreText: string;
  date: string;
  venueId: string;
  homeName: string;
  awayName: string;
  fallback: number;
}) {
  const visibleNumber = Number(scoreText.match(/Match\s*(\d+)/)?.[1]);
  if (visibleNumber) return visibleNumber;

  const teamKey = [date, venueId, homeName, awayName].join("|");
  const venueDateKey = [date, venueId].join("|");
  return (
    (matchNumberMap.byTeams as Record<string, number>)[teamKey] ??
    (matchNumberMap.byVenueDate as Record<string, number>)[venueDateKey] ??
    fallback
  );
}

export function parseWorldCupHtml(html: string) {
  const sections = sectionIndex(html);
  const matches: RawParsedMatch[] = [];
  const tableRegex = /<table class="fevent">[\s\S]*?<\/table>/g;

  for (const tableMatch of html.matchAll(tableRegex)) {
    const table = tableMatch[0];
    const start = tableMatch.index ?? 0;
    const before = html.slice(Math.max(0, start - 2600), start);
    const after = html.slice(start + table.length, start + table.length + 2600);
    const date = [...before.matchAll(/class="[^"]*dtstart[^"]*">(\d{4}-\d{2}-\d{2})</g)].at(-1)?.[1];
    const timeHtml = [...before.matchAll(/<div class="ftime">([\s\S]*?)<\/div>/g)].at(-1)?.[1];
    const venueHtml = after.match(/<span itemprop="name address">([\s\S]*?)<\/span>/)?.[1] ?? "";
    const homeHtml = table.match(/<th class="fhome"[\s\S]*?>([\s\S]*?)<\/th>/)?.[1];
    const scoreHtml = table.match(/<th class="fscore">([\s\S]*?)<\/th>/)?.[1];
    const awayHtml = table.match(/<th class="faway"[\s\S]*?>([\s\S]*?)<\/th>/)?.[1];

    if (!date || !timeHtml || !homeHtml || !scoreHtml || !awayHtml) continue;

    const parsedTime = parseLocalTime(timeHtml);
    const scoreText = stripTags(scoreHtml);
    const section = sectionFor(sections, start);
    const venueLabel = stripTags(venueHtml);
    const venueId = venueIdFromLabel(venueLabel);
    const homeName = stripTags(homeHtml);
    const awayName = stripTags(awayHtml);
    const matchNumber = resolveMatchNumber({
      scoreText,
      date,
      venueId,
      homeName,
      awayName,
      fallback: matches.length + 1
    });
    const score = parseScore(scoreText);

    matches.push({
      id: `m${String(matchNumber).padStart(3, "0")}`,
      matchNumber,
      phase: section.phase,
      round: section.round,
      group: section.group ?? null,
      date,
      localTime: parsedTime.display,
      kickoffUtc: toUtcIso(date, parsedTime),
      utcOffset: parsedTime.offsetHours,
      venueId,
      venueLabel,
      home: slotFromName(homeName),
      away: slotFromName(awayName),
      status: score ? "finished" : "scheduled",
      score
    });
  }

  return matches.sort((a, b) => a.matchNumber - b.matchNumber);
}

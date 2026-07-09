import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const outputPath = resolve(projectRoot, "src/data/worldcup.generated.json");
const matchNumberMapPath = resolve(projectRoot, "src/data/match-number-map.json");
const sourceUrl =
  "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup";
const localSnapshot = "/tmp/worldcup2026.html";
const matchNumberMap = JSON.parse(readFileSync(matchNumberMapPath, "utf8"));
const expectedMatchCount = 104;

const sectionLabels = {
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

function stripTags(value) {
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

function decodeHtml(value) {
  const named = {
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

function parseLocalTime(value) {
  const text = stripTags(value).replace("−", "-");
  const match = text.match(
    /(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)\s*UTC([+-]\d+)/
  );
  if (!match) {
    throw new Error(`Unable to parse kickoff time: ${text}`);
  }
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const isPm = match[3] === "p.m.";
  if (isPm && hours !== 12) hours += 12;
  if (!isPm && hours === 12) hours = 0;
  const offsetHours = Number(match[4]);
  return { display: text, hours, minutes, offsetHours };
}

function toUtcIso(date, parsedTime) {
  const utcMillis = Date.UTC(
    Number(date.slice(0, 4)),
    Number(date.slice(5, 7)) - 1,
    Number(date.slice(8, 10)),
    parsedTime.hours - parsedTime.offsetHours,
    parsedTime.minutes
  );
  return new Date(utcMillis).toISOString();
}

function sectionIndex(html) {
  return Object.keys(sectionLabels)
    .map((id) => ({ id, index: html.indexOf(`id="${id}"`) }))
    .filter((entry) => entry.index >= 0)
    .sort((a, b) => a.index - b.index);
}

function sectionFor(sections, index) {
  let current = sections[0];
  for (const section of sections) {
    if (section.index > index) break;
    current = section;
  }
  return sectionLabels[current.id];
}

function slotFromName(name) {
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

function venueIdFromLabel(label) {
  return label
    .split(",")[0]
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseScore(text) {
  const normalized = text.replace("–", "-").trim();
  const match = normalized.match(/^(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function resolveMatchNumber({
  scoreText,
  date,
  venueId,
  homeName,
  awayName,
  fallback
}) {
  const visibleNumber = Number(scoreText.match(/Match\s*(\d+)/)?.[1]);
  if (visibleNumber) return visibleNumber;

  const teamKey = [date, venueId, homeName, awayName].join("|");
  const venueDateKey = [date, venueId].join("|");
  return (
    matchNumberMap.byTeams[teamKey] ??
    matchNumberMap.byVenueDate[venueDateKey] ??
    fallback
  );
}

function parseMatches(html) {
  const sections = sectionIndex(html);
  const matches = [];
  const tableRegex = /<table class="fevent">[\s\S]*?<\/table>/g;

  for (const tableMatch of html.matchAll(tableRegex)) {
    const table = tableMatch[0];
    const before = html.slice(Math.max(0, tableMatch.index - 2600), tableMatch.index);
    const after = html.slice(tableMatch.index + table.length, tableMatch.index + table.length + 2600);
    const date = [...before.matchAll(/class="[^"]*dtstart[^"]*">(\d{4}-\d{2}-\d{2})</g)].at(-1)?.[1];
    const timeHtml = [...before.matchAll(/<div class="ftime">([\s\S]*?)<\/div>/g)].at(-1)?.[1];
    const venueHtml = after.match(/<span itemprop="name address">([\s\S]*?)<\/span>/)?.[1] ?? "";
    const homeHtml = table.match(/<th class="fhome"[\s\S]*?>([\s\S]*?)<\/th>/)?.[1];
    const scoreHtml = table.match(/<th class="fscore">([\s\S]*?)<\/th>/)?.[1];
    const awayHtml = table.match(/<th class="faway"[\s\S]*?>([\s\S]*?)<\/th>/)?.[1];

    if (!date || !timeHtml || !homeHtml || !scoreHtml || !awayHtml) {
      continue;
    }

    const parsedTime = parseLocalTime(timeHtml);
    const scoreText = stripTags(scoreHtml);
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
    const section = sectionFor(sections, tableMatch.index);
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

async function loadHtml() {
  if (existsSync(localSnapshot)) {
    return {
      html: readFileSync(localSnapshot, "utf8"),
      source: `local:${localSnapshot}`
    };
  }

  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent":
        "WorldCup2026WatchGuide/0.1 (+local development data refresh)"
    }
  });
  if (!response.ok) {
    throw new Error(`Unable to fetch ${sourceUrl}: ${response.status}`);
  }
  return { html: await response.text(), source: sourceUrl };
}

function buildGroups(matches) {
  return Object.fromEntries(
    "ABCDEFGHIJKL".split("").map((group) => [
      group,
      matches
        .filter((match) => match.group === group)
        .flatMap((match) => [match.home, match.away])
        .filter((slot) => slot.type === "team")
        .map((slot) => slot.name)
        .filter((name, index, names) => names.indexOf(name) === index)
    ])
  );
}

function fallbackToPreviousSnapshot(reason, parsedCount = 0) {
  if (!existsSync(outputPath)) {
    throw new Error(`${reason}; no previous snapshot exists`);
  }

  const previous = JSON.parse(readFileSync(outputPath, "utf8"));
  if (!Array.isArray(previous.matches) || previous.matches.length !== expectedMatchCount) {
    throw new Error(`${reason}; previous snapshot is not complete`);
  }

  const payload = {
    ...previous,
    refreshStatus: {
      ok: false,
      checkedAt: new Date().toISOString(),
      message: reason,
      parsedCount,
      expectedCount: expectedMatchCount,
      retainedGeneratedAt: previous.generatedAt
    }
  };

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.warn(`${reason}; retained previous ${previous.matches.length}-match snapshot`);
  return false;
}

let html;
let source;
try {
  ({ html, source } = await loadHtml());
} catch (error) {
  fallbackToPreviousSnapshot(
    `Unable to fetch source: ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(0);
}

const matches = parseMatches(html);

if (matches.length !== expectedMatchCount) {
  fallbackToPreviousSnapshot(
    `Expected ${expectedMatchCount} matches, parsed ${matches.length}`,
    matches.length
  );
  process.exit(0);
}

const groups = buildGroups(matches);

const payload = {
  generatedAt: new Date().toISOString(),
  source,
  sourceUrl,
  matches,
  groups,
  refreshStatus: {
    ok: true,
    checkedAt: new Date().toISOString(),
    message: `Parsed ${matches.length} matches`,
    parsedCount: matches.length,
    expectedCount: expectedMatchCount
  }
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${matches.length} matches to ${outputPath}`);

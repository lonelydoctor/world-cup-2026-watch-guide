import { displaySlot } from "@/lib/data";
import type { Match } from "@/lib/types";

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsDate(iso: string) {
  return iso.replace(/[-:]/g, "").replace(".000Z", "Z");
}

export function buildIcs(matches: Match[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//WorldCup2026WatchGuide//CN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  for (const match of matches) {
    const start = new Date(match.kickoffUtc);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const summary = `${displaySlot(match.home)} vs ${displaySlot(match.away)} - ${match.phase}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:worldcup2026-${match.id}@watch-guide.local`,
      `DTSTAMP:${toIcsDate(new Date().toISOString())}`,
      `DTSTART:${toIcsDate(start.toISOString())}`,
      `DTEND:${toIcsDate(end.toISOString())}`,
      `SUMMARY:${escapeIcs(summary)}`,
      `LOCATION:${escapeIcs(`${match.venue.stadium}, ${match.venue.city}`)}`,
      `DESCRIPTION:${escapeIcs(`比赛 ${match.matchNumber} · ${match.phase} · 球场当地时间 ${match.localTime}`)}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return `${lines.join("\r\n")}\r\n`;
}

export function buildIcsDataUrl(matches: Match[]) {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(matches))}`;
}

import { NextResponse } from "next/server";
import { matches, sourceAudit, teams, venues } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET() {
  const statusCounts = matches.reduce<Record<string, number>>((acc, match) => {
    acc[match.status] = (acc[match.status] ?? 0) + 1;
    return acc;
  }, {});
  const nextMatch = matches
    .filter((match) => new Date(match.kickoffUtc).getTime() >= Date.now())
    .sort((a, b) => +new Date(a.kickoffUtc) - +new Date(b.kickoffUtc))[0];

  return NextResponse.json({
    sourceAudit,
    totals: {
      matches: matches.length,
      teams: teams.length,
      venues: venues.length,
      finished: statusCounts.finished ?? 0,
      live: statusCounts.live ?? 0,
      scheduled: statusCounts.scheduled ?? 0
    },
    nextMatch: nextMatch
      ? {
          id: nextMatch.id,
          matchNumber: nextMatch.matchNumber,
          kickoffUtc: nextMatch.kickoffUtc,
          phase: nextMatch.phase,
          venue: nextMatch.venue.cityZh
      }
      : null,
    refreshStatus: sourceAudit.refreshStatus,
    refreshPolicy: "世界杯期间每 6 小时刷新一次公开赛程快照；不承诺分钟级直播比分。"
  });
}

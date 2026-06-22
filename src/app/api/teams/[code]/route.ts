import { NextResponse } from "next/server";
import { computeStandings, getTeam, matchesForTeam, sourceAudit } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const team = getTeam(code);
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  return NextResponse.json({
    sourceAudit,
    team,
    matches: matchesForTeam(team),
    standings: computeStandings(team.group)
  });
}

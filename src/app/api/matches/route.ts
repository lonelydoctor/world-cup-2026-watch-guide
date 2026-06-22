import { NextResponse } from "next/server";
import { filterMatches } from "@/lib/filters";
import { sourceAudit } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const matches = filterMatches({
    dateRange: params.get("dateRange"),
    city: params.get("city"),
    team: params.get("team"),
    round: params.get("round"),
    status: params.get("status"),
    timeZone: params.get("timeZone")
  });

  return NextResponse.json({
    sourceAudit,
    count: matches.length,
    matches
  });
}

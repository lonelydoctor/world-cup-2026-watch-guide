import { NextResponse } from "next/server";
import { matches, sourceAudit, venues } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    sourceAudit,
    venues: venues.map((venue) => {
      const venueMatches = matches.filter((match) => match.venueId === venue.id);
      return {
        ...venue,
        matchCount: venueMatches.length,
        futureMatches: venueMatches
          .filter((match) => new Date(match.kickoffUtc).getTime() >= Date.now())
          .slice(0, 5)
      };
    })
  });
}

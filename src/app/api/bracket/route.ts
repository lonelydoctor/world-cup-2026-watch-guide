import { NextResponse } from "next/server";
import { computeStandings, matches, sourceAudit } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET() {
  const standings = Object.fromEntries(
    "ABCDEFGHIJKL".split("").map((group) => [group, computeStandings(group)])
  );
  const knockout = matches.filter((match) => match.group === null);

  return NextResponse.json({
    sourceAudit,
    standings,
    knockout
  });
}

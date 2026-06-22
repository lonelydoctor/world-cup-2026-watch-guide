import { NextResponse } from "next/server";
import { answerConcierge } from "@/lib/concierge";
import { sourceAudit } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const q = params.get("q") ?? "";
  const timeZone = params.get("timeZone") ?? "America/Los_Angeles";

  return NextResponse.json({
    sourceAudit,
    answer: answerConcierge(q, timeZone)
  });
}

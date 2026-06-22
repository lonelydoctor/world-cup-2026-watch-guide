import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { NextResponse } from "next/server";
import { parseWorldCupHtml } from "@/lib/server/wiki-parser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const sourceUrl = "https://en.wikipedia.org/wiki/2026_FIFA_World_Cup";

async function refresh() {
  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent":
        "WorldCup2026WatchGuide/0.1 (+scheduled refresh)"
    },
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Fetch failed with ${response.status}`);
  }
  const html = await response.text();
  const matches = parseWorldCupHtml(html);
  if (matches.length !== 104) {
    throw new Error(`Expected 104 matches, parsed ${matches.length}`);
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: sourceUrl,
    sourceUrl,
    matches,
    groups: Object.fromEntries(
      "ABCDEFGHIJKL".split("").map((group) => [
        group,
        matches
          .filter((match) => match.group === group)
          .flatMap((match) => [match.home, match.away])
          .filter((slot) => slot.type === "team")
          .map((slot) => slot.name)
          .filter((name, index, names) => names.indexOf(name) === index)
      ])
    )
  };

  const outputPath = resolve(process.cwd(), "src/data/worldcup.generated.json");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return { outputPath, count: matches.length, generatedAt: payload.generatedAt };
}

export async function POST() {
  try {
    return NextResponse.json(await refresh());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown refresh error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}

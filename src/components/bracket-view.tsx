import { displaySlot } from "@/lib/data";
import type { Match, Standing } from "@/lib/types";
import { SlotFlag } from "@/components/flag";

const roundOrder = [
  "Round of 32",
  "Round of 16",
  "Quarterfinals",
  "Semifinals",
  "Third place",
  "Final"
];

export function BracketView({
  standings,
  knockout
}: {
  standings: Record<string, Standing[]>;
  knockout: Match[];
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(standings).map(([group, rows]) => (
          <article key={group} className="rounded border border-white/10 bg-white/[0.055] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Group {group}</h2>
              <span className="text-xs text-white/44">前二 + 最佳第三</span>
            </div>
            <div className="space-y-2">
              {rows.map((row, index) => (
                <div
                  key={row.team.code}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded px-2 py-2 ${
                    index < 2 ? "bg-trophy-400/12" : index === 2 ? "bg-white/8" : "bg-black/10"
                  }`}
                >
                  <span className="text-xs text-white/42">{index + 1}</span>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`fi fi-${row.team.flagCode} rounded-[2px]`} />
                    <span className="truncate text-sm text-white">{row.team.zhName}</span>
                  </span>
                  <span className="text-sm font-bold text-white">{row.points}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-x-auto rounded border border-white/10 bg-pitch-900/72 p-4 shadow-panel">
        <div className="grid min-w-[980px] grid-cols-6 gap-3">
          {roundOrder.map((round) => {
            const roundMatches = knockout.filter((match) => match.round === round);
            return (
              <div key={round} className="space-y-3">
                <h2 className="sticky top-0 rounded bg-black/20 px-2 py-2 text-sm font-semibold text-white">
                  {roundLabel(round)}
                </h2>
                {roundMatches.map((match) => (
                  <article key={match.id} className="rounded border border-white/10 bg-white/[0.055] p-3">
                    <div className="mb-2 text-[11px] text-trophy-400">
                      M{match.matchNumber} · {match.venue.cityZh}
                    </div>
                    <SlotRow match={match} side="home" />
                    <div className="my-2 h-px bg-white/10" />
                    <SlotRow match={match} side="away" />
                  </article>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SlotRow({ match, side }: { match: Match; side: "home" | "away" }) {
  const slot = match[side];
  return (
    <div className="flex min-w-0 items-center gap-2">
      <SlotFlag slot={slot} />
      <span className="truncate text-sm text-white/84">{displaySlot(slot)}</span>
    </div>
  );
}

function roundLabel(round: string) {
  const labels: Record<string, string> = {
    "Round of 32": "32强",
    "Round of 16": "16强",
    Quarterfinals: "1/4决赛",
    Semifinals: "半决赛",
    "Third place": "三四名",
    Final: "决赛"
  };
  return labels[round] ?? round;
}

import { BracketView } from "@/components/bracket-view";
import { SourceBadge } from "@/components/source-badge";
import { computeStandings, matches, sourceAudit } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function BracketPage() {
  const standings = Object.fromEntries(
    "ABCDEFGHIJKL".split("").map((group) => [group, computeStandings(group)])
  );
  const knockout = matches.filter((match) => match.group === null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white">对阵图</h1>
        <p className="mt-1 text-sm text-white/56">国旗、国家名和晋级占位会随赛果刷新</p>
      </div>
      <SourceBadge audit={sourceAudit} />
      <BracketView standings={standings} knockout={knockout} />
    </div>
  );
}

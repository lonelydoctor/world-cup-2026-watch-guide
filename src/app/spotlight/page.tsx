import { SourceBadge } from "@/components/source-badge";
import { SpotlightBoard } from "@/components/spotlight-board";
import { matches, sourceAudit } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function SpotlightPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white">半决赛 / 决赛看点</h1>
        <p className="mt-1 text-sm text-white/56">核心球员、预计焦点、伤停停赛入口</p>
      </div>
      <SourceBadge audit={sourceAudit} />
      <SpotlightBoard matches={matches} />
    </div>
  );
}

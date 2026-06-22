import { CityExplorer } from "@/components/city-explorer";
import { SourceBadge } from "@/components/source-badge";
import { matches, sourceAudit, venues } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function CitiesPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white">城市地图</h1>
        <p className="mt-1 text-sm text-white/56">按主办城市切换比赛和球场信息</p>
      </div>
      <SourceBadge audit={sourceAudit} />
      <CityExplorer venues={venues} matches={matches} />
    </div>
  );
}

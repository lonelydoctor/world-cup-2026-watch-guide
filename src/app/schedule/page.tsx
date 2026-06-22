import { ScheduleExplorer } from "@/components/schedule-explorer";
import { SourceBadge } from "@/components/source-badge";
import { matches, sourceAudit, teams, venues } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function SchedulePage() {
  return (
    <div className="space-y-5">
      <PageTitle
        title="全赛程"
        subtitle="按时间、城市、国家、轮次和状态筛选"
      />
      <SourceBadge audit={sourceAudit} />
      <ScheduleExplorer matches={matches} teams={teams} venues={venues} />
    </div>
  );
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-3xl font-black text-white">{title}</h1>
      <p className="mt-1 text-sm text-white/56">{subtitle}</p>
    </div>
  );
}

import { Activity, CalendarClock, Database, ShieldCheck, Trophy } from "lucide-react";
import Link from "next/link";
import { SourceBadge } from "@/components/source-badge";
import { displaySlot, matches, nextMatches, sourceAudit, teams, venues } from "@/lib/data";
import { formatInTimeZone } from "@/lib/time";

export const dynamic = "force-dynamic";

export default function StatusPage() {
  const finished = matches.filter((match) => match.status === "finished").length;
  const live = matches.filter((match) => match.status === "live").length;
  const scheduled = matches.filter((match) => match.status === "scheduled").length;
  const next = nextMatches(1)[0] ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black text-white">数据状态</h1>
        <p className="mt-1 text-sm text-white/56">
          面向公开发布的透明状态页，说明数据来源、刷新频率和当前赛程快照。
        </p>
      </div>
      <SourceBadge audit={sourceAudit} />

      <section className="grid gap-3 md:grid-cols-4">
        <Stat icon={Trophy} label="比赛" value={`${matches.length} 场`} />
        <Stat icon={ShieldCheck} label="球队" value={`${teams.length} 支`} />
        <Stat icon={Database} label="城市" value={`${venues.length} 座`} />
        <Stat icon={Activity} label="已完赛" value={`${finished} 场`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded border border-white/10 bg-white/[0.055] p-5 shadow-panel">
          <h2 className="text-xl font-bold text-white">刷新策略</h2>
          <div className="mt-4 grid gap-3 text-sm text-white/68">
            <Row label="数据来源" value="公开赛程/比分页面快照，当前以 Wikipedia 赛程摘要为主，保留 FIFA 官方赛事页作为核验来源。" />
            <Row label="刷新频率" value="世界杯期间每 6 小时尝试刷新一次；赛后周期更新，不做实时直播比分。" />
            <Row label="人工覆盖" value="可通过 manual-overrides.json 覆盖比分或淘汰赛未决席位。" />
            <Row label="非官方声明" value="本项目不是 FIFA 官方产品，不使用官方标识、吉祥物或商业素材。" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={sourceAudit.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded bg-trophy-400 px-3 py-2 text-sm font-semibold text-pitch-950"
            >
              查看当前来源
            </a>
            <Link
              href="/api/status"
              className="rounded border border-white/12 px-3 py-2 text-sm text-white/74 hover:bg-white/10"
            >
              查看状态 API
            </Link>
          </div>
        </div>

        <aside className="rounded border border-white/10 bg-white/[0.055] p-5 shadow-panel">
          <div className="flex items-center gap-2">
            <CalendarClock size={18} className="text-trophy-400" />
            <h2 className="text-lg font-semibold text-white">下一场</h2>
          </div>
          {next ? (
            <div className="mt-4 space-y-2">
              <div className="text-2xl font-black text-white">
                {displaySlot(next.home)} vs {displaySlot(next.away)}
              </div>
              <p className="text-sm text-white/64">
                Match {next.matchNumber} · {next.phase} · {next.venue.cityZh}
              </p>
              <p className="text-sm text-white/64">
                本地 {formatInTimeZone(next.kickoffUtc, "Asia/Shanghai")}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/60">当前快照没有未来比赛。</p>
          )}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Mini label="未开赛" value={scheduled} />
            <Mini label="进行中" value={live} />
            <Mini label="已结束" value={finished} />
          </div>
        </aside>
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded border border-white/10 bg-white/[0.055] p-4">
      <Icon className="mb-3 text-trophy-400" size={18} />
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-white/48">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/10 bg-black/16 p-3">
      <div className="text-xs text-white/44">{label}</div>
      <div className="mt-1 text-white/74">{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-white/10 bg-black/16 p-3">
      <div className="text-lg font-black text-white">{value}</div>
      <div className="text-xs text-white/46">{label}</div>
    </div>
  );
}

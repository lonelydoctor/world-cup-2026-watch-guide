import Link from "next/link";
import { Activity, Database, ExternalLink, RotateCw, ShieldCheck } from "lucide-react";
import type { SourceAudit } from "@/lib/types";
import { formatInTimeZone } from "@/lib/time";

export function SourceBadge({ audit }: { audit: SourceAudit }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/56">
      <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2 py-1">
        <ShieldCheck size={13} />
        非官方项目
      </span>
      {audit.refreshStatus && !audit.refreshStatus.ok && (
        <Link
          href="/status"
          className="inline-flex items-center gap-1 rounded border border-matchred/40 bg-matchred/16 px-2 py-1 text-white transition hover:bg-matchred/24"
        >
          <Activity size={13} />
          保留上次快照
        </Link>
      )}
      <a
        href={audit.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2 py-1 transition hover:bg-white/10 hover:text-white"
      >
        <Database size={13} />
        数据 {formatInTimeZone(audit.generatedAt, "UTC", { timeZoneName: "short" })}
        <ExternalLink size={12} />
      </a>
      <span className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2 py-1">
        <RotateCw size={13} />
        赛后 6 小时
      </span>
      <Link
        href="/status"
        className="inline-flex items-center gap-1 rounded border border-white/10 bg-white/[0.04] px-2 py-1 transition hover:bg-white/10 hover:text-white"
      >
        <Activity size={13} />
        状态页
      </Link>
    </div>
  );
}

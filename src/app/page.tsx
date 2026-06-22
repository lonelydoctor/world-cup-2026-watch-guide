import { CalendarClock, MapPin, Radio, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ClientTime } from "@/components/client-time";
import { ConciergePanel } from "@/components/concierge-panel";
import { MatchCard } from "@/components/match-card";
import { SourceBadge } from "@/components/source-badge";
import { displaySlot, matches, nextMatches, sourceAudit, venues } from "@/lib/data";
import { filterMatches } from "@/lib/filters";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const upcoming = nextMatches(5);
  const today = filterMatches({
    dateRange: "today",
    timeZone: "America/Los_Angeles"
  });
  const featured = upcoming[0] ?? matches[0];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative overflow-hidden rounded border border-white/10 bg-pitch-900/78 p-5 shadow-panel">
          <Image
            src="/stadium-hero.svg"
            alt=""
            fill
            unoptimized
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="object-cover opacity-18"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pitch-950 via-pitch-950/82 to-pitch-950/44" />
          <div className="relative">
            <SourceBadge audit={sourceAudit} />
            <div className="mt-10 max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded bg-matchred px-2.5 py-1 text-xs font-semibold text-white">
                <Radio size={14} />
                Matchday Room
              </p>
              <h1 className="text-3xl font-black leading-tight text-white md:text-5xl">
                {displaySlot(featured.home)} vs {displaySlot(featured.away)}
              </h1>
              <p className="mt-3 text-base text-white/68 md:text-lg">
                {featured.phase} · {featured.venue.cityZh} · 本地{" "}
                <ClientTime iso={featured.kickoffUtc} />
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Stat icon={Trophy} label="赛事" value="104 场" />
              <Stat icon={MapPin} label="城市" value={`${venues.length} 座`} />
              <Stat icon={CalendarClock} label="今日" value={`${today.length} 场`} />
            </div>
          </div>
        </div>
        <ConciergePanel />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">下一批比赛</h2>
              <p className="text-sm text-white/52">默认按你的本地时间排序</p>
            </div>
            <Link href="/schedule" className="rounded border border-white/12 px-3 py-2 text-sm text-white/70 hover:bg-white/10">
              全赛程
            </Link>
          </div>
          <div className="grid gap-3">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
        <aside className="rounded border border-white/10 bg-white/[0.055] p-4 shadow-panel">
          <h2 className="text-lg font-semibold text-white">城市热区</h2>
          <div className="mt-4 space-y-3">
            {venues.slice(0, 6).map((venue) => {
              const count = matches.filter((match) => match.venueId === venue.id).length;
              return (
                <Link
                  href="/cities"
                  key={venue.id}
                  className="flex items-center justify-between rounded border border-white/10 bg-black/16 px-3 py-3 transition hover:bg-white/10"
                >
                  <span>
                    <span className="block text-sm font-semibold text-white">{venue.cityZh}</span>
                    <span className="block text-xs text-white/48">{venue.stadium}</span>
                  </span>
                  <span className="text-sm font-bold text-trophy-400">{count}</span>
                </Link>
              );
            })}
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
    <div className="rounded border border-white/10 bg-black/24 p-3">
      <Icon className="mb-3 text-trophy-400" size={18} />
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-xs text-white/48">{label}</div>
    </div>
  );
}

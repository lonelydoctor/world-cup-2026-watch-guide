import { notFound } from "next/navigation";
import { MatchCard } from "@/components/match-card";
import { SourceBadge } from "@/components/source-badge";
import { computeStandings, getTeam, matchesForTeam, sourceAudit } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TeamPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const team = getTeam(code);
  if (!team) notFound();
  const teamMatches = matchesForTeam(team);
  const standings = computeStandings(team.group);

  return (
    <div className="space-y-5">
      <section className="rounded border border-white/10 bg-pitch-900/78 p-5 shadow-panel">
        <SourceBadge audit={sourceAudit} />
        <div className="mt-6 flex items-center gap-4">
          <span className={`fi fi-${team.flagCode} rounded-[3px] text-5xl`} />
          <div>
            <p className="text-sm text-trophy-400">Group {team.group} · {team.confederation}</p>
            <h1 className="text-3xl font-black text-white">{team.zhName}</h1>
            <p className="mt-1 text-sm text-white/54">{team.name}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">比赛</h2>
          <div className="grid gap-3">
            {teamMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
        <aside className="space-y-4">
          <article className="rounded border border-white/10 bg-white/[0.055] p-4">
            <h2 className="font-semibold text-white">小组排名</h2>
            <div className="mt-3 space-y-2">
              {standings.map((row, index) => (
                <div key={row.team.code} className="flex items-center justify-between rounded bg-black/18 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-white/80">
                    <span className="text-white/40">{index + 1}</span>
                    <span className={`fi fi-${row.team.flagCode} rounded-[2px]`} />
                    {row.team.zhName}
                  </span>
                  <span className="font-bold text-white">{row.points}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="rounded border border-white/10 bg-white/[0.055] p-4">
            <h2 className="font-semibold text-white">球员看点</h2>
            <div className="mt-3 space-y-2">
              {team.spotlight.players.map((player) => (
                <div key={player} className="rounded bg-black/18 px-3 py-2 text-sm text-white/72">
                  {player}
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}

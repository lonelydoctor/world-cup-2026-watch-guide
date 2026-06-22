import { AlertTriangle, ClipboardList, Flame, Users } from "lucide-react";
import { displaySlot, teams } from "@/lib/data";
import type { Match } from "@/lib/types";
import { MatchCard } from "@/components/match-card";

export function SpotlightBoard({ matches }: { matches: Match[] }) {
  const keyMatches = matches.filter((match) =>
    ["Semifinals", "Final", "Third place"].includes(match.round)
  );
  const contenderTeams = teams.filter((team) =>
    ["ARG", "BRA", "FRA", "ENG", "ESP", "POR", "GER", "NED"].includes(team.code)
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-4">
        <article className="rounded border border-white/10 bg-pitch-900/78 p-4 shadow-panel">
          <div className="mb-3 flex items-center gap-2">
            <Flame className="text-matchred" size={19} />
            <h2 className="text-lg font-semibold text-white">冠军周看点</h2>
          </div>
          <div className="grid gap-3">
            {keyMatches.map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </div>
        </article>

        <article className="rounded border border-white/10 bg-white/[0.055] p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="text-trophy-400" size={18} />
            <h2 className="font-semibold text-white">刷新边界</h2>
          </div>
          <p className="text-sm leading-6 text-white/62">
            半决赛和决赛队伍确认后，球员看点按赛后 6 小时更新。未确认前展示热门队伍的赛前观赛焦点。
          </p>
        </article>
      </section>

      <section className="rounded border border-white/10 bg-white/[0.055] p-4 shadow-panel">
        <div className="mb-4 flex items-center gap-2">
          <Users className="text-trophy-400" size={19} />
          <h2 className="text-lg font-semibold text-white">球员观赛卡</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {contenderTeams.map((team) => (
            <article key={team.code} className="rounded border border-white/10 bg-black/18 p-4">
              <div className="flex items-center gap-3">
                <span className={`fi fi-${team.flagCode} rounded-[2px] text-2xl`} />
                <div>
                  <h3 className="font-semibold text-white">{team.zhName}</h3>
                  <p className="text-xs text-white/50">Group {team.group}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {team.spotlight.players.map((player) => (
                  <div key={player} className="flex items-center gap-2 text-sm text-white/72">
                    <ClipboardList size={14} className="text-trophy-400" />
                    {player}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-white/50">{team.spotlight.note}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function MatchStoryline({ match }: { match: Match }) {
  return `${displaySlot(match.home)} 对 ${displaySlot(match.away)} · ${match.venue.cityZh}`;
}

"use client";

import { Search, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ConciergeAnswer } from "@/lib/types";
import { MatchCard } from "@/components/match-card";

const examples = ["今晚有什么比赛", "西雅图未来几天有比赛吗", "阿根廷未来几天赛程", "半决赛和决赛看点"];

export function ConciergePanel() {
  const [query, setQuery] = useState("今晚有什么比赛");
  const [answer, setAnswer] = useState<ConciergeAnswer | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async (nextQuery: string) => {
    setLoading(true);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const response = await fetch(
      `/api/concierge?q=${encodeURIComponent(nextQuery)}&timeZone=${encodeURIComponent(timeZone)}`
    );
    const payload = await response.json();
    setAnswer(payload.answer);
    setLoading(false);
  }, []);

  useEffect(() => {
    ask("今晚有什么比赛");
  }, [ask]);

  return (
    <section className="rounded border border-white/10 bg-pitch-900/72 p-4 shadow-panel">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded bg-trophy-400 text-pitch-950">
          <Sparkles size={17} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">观赛管家</h2>
          <p className="text-xs text-white/52">规则引擎 · 不调用大模型</p>
        </div>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          ask(query);
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 rounded border border-white/12 bg-black/24 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/32 focus:border-trophy-400"
          placeholder="今晚有什么比赛"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded bg-trophy-400 px-3 py-2 text-sm font-semibold text-pitch-950 transition hover:bg-trophy-500"
        >
          <Search size={16} />
          查询
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => {
              setQuery(example);
              ask(example);
            }}
            className="rounded border border-white/10 bg-white/6 px-2.5 py-1.5 text-xs text-white/66 transition hover:bg-white/12"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {loading && <div className="rounded bg-white/6 p-4 text-sm text-white/60">查询中...</div>}
        {!loading && answer && (
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-white">{answer.title}</h3>
              <p className="mt-1 text-sm text-white/62">{answer.summary}</p>
            </div>
            <div className="grid gap-3">
              {answer.matches.slice(0, 4).map((match) => (
                <MatchCard key={match.id} match={match} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

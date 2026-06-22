"use client";

import { CalendarPlus, Filter, Link2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { buildIcs } from "@/lib/ics";
import { groupByDate } from "@/lib/filters";
import { formatInTimeZone } from "@/lib/time";
import type { Match, Team, Venue } from "@/lib/types";
import { MatchCard } from "@/components/match-card";

export function ScheduleExplorer({
  matches,
  teams,
  venues
}: {
  matches: Match[];
  teams: Team[];
  venues: Venue[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [dateRange, setDateRange] = useState(() => searchParams.get("dateRange") ?? "all");
  const [city, setCity] = useState(() => searchParams.get("city") ?? "all");
  const [team, setTeam] = useState(() => searchParams.get("team") ?? "all");
  const [round, setRound] = useState(() => searchParams.get("round") ?? "all");
  const [status, setStatus] = useState(() => searchParams.get("status") ?? "all");
  const [notice, setNotice] = useState("");
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const filtered = useMemo(() => {
    const now = new Date();
    return matches.filter((match) => {
      if (city !== "all" && match.venueId !== city) return false;
      if (team !== "all") {
        const hit =
          (match.home.type === "team" && match.home.code === team) ||
          (match.away.type === "team" && match.away.code === team);
        if (!hit) return false;
      }
      if (round !== "all" && match.round !== round) return false;
      if (status !== "all" && match.status !== status) return false;
      if (dateRange !== "all") {
        const matchTime = new Date(match.kickoffUtc).getTime();
        const diff = matchTime - now.getTime();
        if (dateRange === "next3" && (diff < 0 || diff > 3 * 86400000)) return false;
        if (dateRange === "next7" && (diff < 0 || diff > 7 * 86400000)) return false;
        if (dateRange === "group" && match.group === null) return false;
        if (dateRange === "knockout" && match.group !== null) return false;
      }
      return true;
    });
  }, [city, dateRange, matches, round, status, team]);

  const grouped = groupByDate(filtered, timeZone);
  const roundOptions = Array.from(new Set(matches.map((match) => match.round)));

  function updateUrl(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function updateFilter(key: string, value: string) {
    setNotice("");
    if (key === "dateRange") setDateRange(value);
    if (key === "city") setCity(value);
    if (key === "team") setTeam(value);
    if (key === "round") setRound(value);
    if (key === "status") setStatus(value);
    updateUrl(key, value);
  }

  function downloadCalendar(items: Match[], filename: string) {
    const blob = new Blob([buildIcs(items)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function copyShareLink() {
    if (!navigator.clipboard) {
      setNotice("当前浏览器不支持复制链接");
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setNotice("已复制当前筛选链接");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <aside className="rounded border border-white/10 bg-white/[0.055] p-4 shadow-panel lg:sticky lg:top-24 lg:self-start">
        <div className="mb-4 flex items-center gap-2">
          <Filter size={18} className="text-trophy-400" />
          <h2 className="font-semibold text-white">筛选</h2>
        </div>
        <div className="space-y-3">
          <Select label="时间" value={dateRange} onChange={(value) => updateFilter("dateRange", value)}>
            <option value="all">全部时间</option>
            <option value="next3">未来 3 天</option>
            <option value="next7">未来 7 天</option>
            <option value="group">小组赛</option>
            <option value="knockout">淘汰赛</option>
          </Select>
          <Select label="城市" value={city} onChange={(value) => updateFilter("city", value)}>
            <option value="all">全部城市</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.cityZh}
              </option>
            ))}
          </Select>
          <Select label="国家" value={team} onChange={(value) => updateFilter("team", value)}>
            <option value="all">全部国家</option>
            {teams.map((item) => (
              <option key={item.code} value={item.code}>
                {item.zhName}
              </option>
            ))}
          </Select>
          <Select label="轮次" value={round} onChange={(value) => updateFilter("round", value)}>
            <option value="all">全部轮次</option>
            {roundOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select label="状态" value={status} onChange={(value) => updateFilter("status", value)}>
            <option value="all">全部状态</option>
            <option value="scheduled">未开赛</option>
            <option value="live">进行中</option>
            <option value="finished">已结束</option>
          </Select>
        </div>
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => downloadCalendar(filtered, "world-cup-2026-filtered.ics")}
            disabled={filtered.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded bg-trophy-400 px-3 py-2 text-sm font-semibold text-pitch-950 transition hover:bg-trophy-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CalendarPlus size={16} />
            导出筛选 {filtered.length} 场
          </button>
          <button
            type="button"
            onClick={() => downloadCalendar(matches, "world-cup-2026-all-matches.ics")}
            className="flex w-full items-center justify-center gap-2 rounded border border-white/12 bg-white/6 px-3 py-2 text-sm text-white/74 transition hover:bg-white/12"
          >
            <CalendarPlus size={16} />
            全部日历 {matches.length} 场
          </button>
          <button
            type="button"
            onClick={copyShareLink}
            className="flex w-full items-center justify-center gap-2 rounded border border-white/12 bg-white/6 px-3 py-2 text-sm text-white/74 transition hover:bg-white/12"
          >
            <Link2 size={16} />
            复制筛选链接
          </button>
          {notice && <p className="text-xs text-trophy-400">{notice}</p>}
        </div>
      </aside>

      <section className="space-y-5">
        <div className="rounded border border-white/10 bg-pitch-900/70 p-4">
          <div className="text-2xl font-black text-white">{filtered.length} 场</div>
          <div className="mt-1 text-sm text-white/58">本地时区 {timeZone}</div>
        </div>
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-semibold text-white">
                {formatInTimeZone(items[0].kickoffUtc, timeZone, {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  hour: undefined,
                  minute: undefined
                })}
              </h3>
              <span className="text-xs text-white/48">{date}</span>
            </div>
            <div className="grid gap-3">
              {items.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/54">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-white/12 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-trophy-400"
      >
        {children}
      </select>
    </label>
  );
}

"use client";

import Link from "next/link";
import { Bell, CalendarPlus, MapPin, Share2, Star } from "lucide-react";
import { displaySlot } from "@/lib/data";
import { buildIcs } from "@/lib/ics";
import { formatInTimeZone, readableCountdown } from "@/lib/time";
import type { Match } from "@/lib/types";
import { SlotFlag } from "@/components/flag";
import { useEffect, useMemo, useState } from "react";

const storageKey = "wc2026:favorites";

function readFavorites() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}

function downloadIcs(match: Match) {
  const blob = new Blob([buildIcs([match])], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `world-cup-2026-match-${match.matchNumber}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function teamHref(slot: Match["home"]) {
  return slot.type === "team" ? `/teams/${slot.code}` : "#";
}

function buildShareText(match: Match, timeZone: string) {
  return [
    `2026 世界杯观赛：${displaySlot(match.home)} vs ${displaySlot(match.away)}`,
    `${match.phase} · 本地 ${formatInTimeZone(match.kickoffUtc, timeZone)} · ${match.venue.cityZh}`,
    `${match.venue.stadium} · 非官方赛程助手`
  ].join("\n");
}

export function MatchCard({
  match,
  compact = false,
  timeZone
}: {
  match: Match;
  compact?: boolean;
  timeZone?: string;
}) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");
  const userTimeZone = useMemo(
    () =>
      timeZone ||
      (typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "America/Los_Angeles"),
    [timeZone]
  );
  const favorite = favorites.has(match.id);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  function toggleFavorite() {
    const next = new Set(favorites);
    if (next.has(match.id)) next.delete(match.id);
    else next.add(match.id);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
    setFavorites(next);
  }

  async function requestReminder() {
    if (!("Notification" in window)) {
      setNotice("浏览器不支持通知");
      return;
    }
    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;
    if (permission !== "granted") {
      setNotice("未开启通知权限");
      return;
    }
    setNotice("已加入本地提醒");
    const ms = new Date(match.kickoffUtc).getTime() - Date.now() - 30 * 60 * 1000;
    if (ms > 0 && ms < 2147483647) {
      window.setTimeout(() => {
        new Notification(`${displaySlot(match.home)} vs ${displaySlot(match.away)}`, {
          body: `${match.phase} · 30 分钟后开球 · ${match.venue.cityZh}`
        });
      }, ms);
    }
  }

  async function shareMatch() {
    const text = buildShareText(match, userTimeZone);
    const title = `${displaySlot(match.home)} vs ${displaySlot(match.away)}`;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setNotice("已复制分享文案");
        return;
      }

      setNotice("当前浏览器不支持分享");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") {
        setNotice("分享失败，请稍后再试");
      }
    }
  }

  return (
    <article className="rounded border border-white/10 bg-white/[0.055] p-4 shadow-panel backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-white/58">
        <span className="rounded bg-trophy-400/14 px-2 py-1 text-trophy-400">
          Match {match.matchNumber} · {match.phase}
        </span>
        <span>{readableCountdown(match.kickoffUtc)}</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <Link
          href={teamHref(match.home)}
          className="flex min-w-0 items-center gap-2 rounded p-1 transition hover:bg-white/8"
        >
          <SlotFlag slot={match.home} />
          <span className="truncate text-sm font-semibold text-white md:text-base">
            {displaySlot(match.home)}
          </span>
        </Link>
        <div className="text-center">
          {match.score ? (
            <span className="text-xl font-black text-white">
              {match.score.home} - {match.score.away}
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/42">VS</span>
          )}
        </div>
        <Link
          href={teamHref(match.away)}
          className="flex min-w-0 flex-row-reverse items-center gap-2 rounded p-1 text-right transition hover:bg-white/8"
        >
          <SlotFlag slot={match.away} />
          <span className="truncate text-sm font-semibold text-white md:text-base">
            {displaySlot(match.away)}
          </span>
        </Link>
      </div>

      {!compact && (
        <div className="mt-4 grid gap-3 border-t border-white/10 pt-3 text-sm text-white/70 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-1">
            <div>
              本地 {formatInTimeZone(match.kickoffUtc, userTimeZone)} · 球场{" "}
              {formatInTimeZone(match.kickoffUtc, match.venue.timezone)}
            </div>
            <div className="flex items-center gap-1 text-white/56">
              <MapPin size={15} />
              {match.venue.stadium} · {match.venue.cityZh}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={toggleFavorite}
              className={`inline-flex items-center gap-1 rounded border px-2.5 py-2 text-xs transition ${
                favorite
                  ? "border-trophy-400 bg-trophy-400 text-pitch-950"
                  : "border-white/12 bg-white/6 text-white/72 hover:bg-white/12"
              }`}
              title="收藏"
            >
              <Star size={15} fill={favorite ? "currentColor" : "none"} />
              收藏
            </button>
            <button
              type="button"
              onClick={requestReminder}
              className="inline-flex items-center gap-1 rounded border border-white/12 bg-white/6 px-2.5 py-2 text-xs text-white/72 transition hover:bg-white/12"
              title="本地提醒"
            >
              <Bell size={15} />
              提醒
            </button>
            <button
              type="button"
              onClick={() => downloadIcs(match)}
              className="inline-flex items-center gap-1 rounded border border-white/12 bg-white/6 px-2.5 py-2 text-xs text-white/72 transition hover:bg-white/12"
              title="导出日历"
            >
              <CalendarPlus size={15} />
              日历
            </button>
            <button
              type="button"
              onClick={shareMatch}
              className="inline-flex items-center gap-1 rounded border border-white/12 bg-white/6 px-2.5 py-2 text-xs text-white/72 transition hover:bg-white/12"
              title="分享比赛"
            >
              <Share2 size={15} />
              分享
            </button>
          </div>
          {notice && <div className="text-xs text-trophy-400 md:col-span-2">{notice}</div>}
        </div>
      )}
    </article>
  );
}

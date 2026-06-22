"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Match, Venue } from "@/lib/types";
import { MatchCard } from "@/components/match-card";

const cityPositions: Record<string, { x: number; y: number }> = {
  "bc-place": { x: 10, y: 18 },
  "lumen-field": { x: 15, y: 30 },
  "levi-s-stadium": { x: 14, y: 54 },
  "sofi-stadium": { x: 16, y: 70 },
  "estadio-akron": { x: 35, y: 77 },
  "estadio-azteca": { x: 43, y: 82 },
  "estadio-bbva": { x: 49, y: 71 },
  "nrg-stadium": { x: 55, y: 66 },
  "atandt-stadium": { x: 55, y: 54 },
  "arrowhead-stadium": { x: 61, y: 43 },
  "bmo-field": { x: 74, y: 25 },
  "gillette-stadium": { x: 87, y: 25 },
  "metlife-stadium": { x: 83, y: 34 },
  "lincoln-financial-field": { x: 81, y: 41 },
  "mercedes-benz-stadium": { x: 73, y: 57 },
  "hard-rock-stadium": { x: 82, y: 76 }
};

export function CityExplorer({
  venues,
  matches
}: {
  venues: Venue[];
  matches: Match[];
}) {
  const [selected, setSelected] = useState("lumen-field");
  const venue = venues.find((item) => item.id === selected) ?? venues[0];
  const venueMatches = useMemo(
    () => matches.filter((match) => match.venueId === venue.id),
    [matches, venue.id]
  );
  const future = venueMatches.filter((match) => new Date(match.kickoffUtc).getTime() >= Date.now());

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="pitch-lines relative min-h-[430px] overflow-hidden rounded border border-white/10 bg-pitch-900/78 p-4 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">主办城市</h2>
            <p className="text-sm text-white/54">16 城市 · 3 个区域</p>
          </div>
          <MapPin className="text-trophy-400" />
        </div>
        <div className="relative h-[340px] rounded border border-white/10 bg-[radial-gradient(circle_at_50%_48%,rgba(23,160,94,0.22),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
          {venues.map((item) => {
            const pos = cityPositions[item.id] ?? { x: 50, y: 50 };
            const active = item.id === venue.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded px-2 py-1 text-[11px] shadow transition ${
                  active
                    ? "bg-trophy-400 text-pitch-950"
                    : "bg-black/50 text-white/76 hover:bg-white/18"
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {item.cityZh}
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded border border-white/10 bg-white/[0.055] p-4 shadow-panel">
        {venue.imageUrl && (
          <Image
            src={venue.imageUrl}
            alt={venue.stadium}
            width={1024}
            height={576}
            className="mb-4 aspect-[16/9] w-full rounded object-cover"
          />
        )}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-trophy-400">{venue.countryZh} · {venue.region}</p>
            <h2 className="mt-1 text-2xl font-black text-white">{venue.cityZh}</h2>
            <p className="mt-1 text-sm text-white/58">{venue.stadium}</p>
          </div>
          <div className="rounded bg-white/8 px-3 py-2 text-right">
            <div className="text-xl font-black text-white">{venueMatches.length}</div>
            <div className="text-xs text-white/50">场</div>
          </div>
        </div>
        <p className="mt-4 rounded border border-white/10 bg-black/18 p-3 text-sm leading-6 text-white/66">
          {venue.travelNote}
        </p>
        <div className="mt-4 space-y-3">
          {(future.length ? future : venueMatches).slice(0, 4).map((match) => (
            <MatchCard key={match.id} match={match} compact />
          ))}
        </div>
      </aside>
    </div>
  );
}

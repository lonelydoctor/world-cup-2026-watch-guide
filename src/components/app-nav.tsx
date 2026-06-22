"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Goal, Home, Map, Sparkles, Trophy } from "lucide-react";

const navItems = [
  { href: "/", label: "今日", icon: Home },
  { href: "/schedule", label: "赛程", icon: CalendarDays },
  { href: "/bracket", label: "对阵", icon: Goal },
  { href: "/cities", label: "城市", icon: Map },
  { href: "/spotlight", label: "看点", icon: Sparkles }
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-1 rounded border border-white/10 bg-white/[0.04] p-1 lg:flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition ${
                active
                  ? "bg-white text-pitch-950"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-pitch-950/94 px-2 pt-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded px-2 py-2 text-[11px] transition ${
                  active ? "bg-white text-pitch-950" : "text-white/68"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="hidden items-center gap-2 text-xs text-white/56 lg:flex">
        <Trophy size={15} className="text-trophy-400" />
        104 场
      </div>
    </>
  );
}

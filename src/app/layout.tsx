import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import "./globals.css";
import { AppNav } from "@/components/app-nav";

export const metadata: Metadata = {
  title: "非官方 2026 世界杯观赛管家",
  description: "非官方中文世界杯赛程、城市、国家和淘汰赛观赛辅助工具",
  keywords: ["2026 世界杯", "世界杯赛程", "观赛助手", "World Cup 2026"],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg"
  },
  appleWebApp: {
    capable: true,
    title: "2026 观赛管家",
    statusBarStyle: "black-translucent"
  },
  openGraph: {
    title: "非官方 2026 世界杯观赛管家",
    description: "中文赛程、城市、国家、对阵图和规则型观赛助手。",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#031912",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen stadium-grid">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-pitch-950/86 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
              <Link href="/" className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded bg-trophy-400 text-pitch-950 shadow-glow">
                  <Trophy size={20} strokeWidth={2.5} />
                </span>
                <span>
                  <span className="block text-sm font-semibold tracking-wide text-white">非官方 2026 观赛管家</span>
                  <span className="block text-xs text-white/54">Unofficial Match Room</span>
                </span>
              </Link>
              <AppNav />
            </div>
          </header>
          <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 lg:px-6 lg:pb-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

export function formatInTimeZone(
  iso: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {}
) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options
  }).format(new Date(iso));
}

export function localDateKey(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(iso));

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function dateKey(date: Date, timeZone: string) {
  return localDateKey(date.toISOString(), timeZone);
}

export function isWithinNextDays(
  iso: string,
  days: number,
  timeZone: string,
  now = new Date()
) {
  const matchDate = localDateKey(iso, timeZone);
  const start = dateKey(now, timeZone);
  const end = dateKey(addDays(now, days), timeZone);
  return matchDate >= start && matchDate <= end;
}

export function isTonight(iso: string, timeZone: string, now = new Date()) {
  const match = new Date(iso);
  const today = dateKey(now, timeZone);
  const matchDay = localDateKey(iso, timeZone);
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      hour12: false
    }).format(match)
  );
  return matchDay === today && hour >= 18;
}

export function minutesUntil(iso: string, now = new Date()) {
  return Math.round((new Date(iso).getTime() - now.getTime()) / 60000);
}

export function readableCountdown(iso: string, now = new Date()) {
  const minutes = minutesUntil(iso, now);
  if (minutes < -150) return "已结束";
  if (minutes < 0) return "进行中或刚结束";
  if (minutes < 60) return `${minutes} 分钟后`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours < 24) return `${hours} 小时 ${rest} 分钟后`;
  return `${Math.floor(hours / 24)} 天后`;
}

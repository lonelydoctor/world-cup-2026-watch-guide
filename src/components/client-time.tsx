"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "@/lib/time";

export function ClientTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setLabel(formatInTimeZone(iso, timeZone));
  }, [iso]);

  return <>{label || formatInTimeZone(iso, "Asia/Shanghai")}</>;
}

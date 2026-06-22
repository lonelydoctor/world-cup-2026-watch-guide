import type { Slot } from "@/lib/types";

export function Flag({
  code,
  label,
  className = "text-xl"
}: {
  code: string | null;
  label: string;
  className?: string;
}) {
  if (!code) {
    return (
      <span
        aria-label={label}
        className={`inline-flex size-7 items-center justify-center rounded border border-white/18 bg-white/8 text-[10px] text-white/60 ${className}`}
      >
        TBD
      </span>
    );
  }

  return (
    <span
      aria-label={label}
      className={`fi fi-${code} rounded-[2px] shadow-sm ${className}`}
    />
  );
}

export function SlotFlag({ slot }: { slot: Slot }) {
  return (
    <Flag
      code={slot.type === "team" ? slot.flagCode : null}
      label={slot.type === "team" ? slot.zhName : slot.zhLabel}
    />
  );
}

"use client";

import * as React from "react";

function diff(target: number) {
  const now = Date.now();
  let delta = Math.max(0, target - now);
  const days = Math.floor(delta / 86_400_000);
  delta -= days * 86_400_000;
  const hours = Math.floor(delta / 3_600_000);
  delta -= hours * 3_600_000;
  const minutes = Math.floor(delta / 60_000);
  delta -= minutes * 60_000;
  const seconds = Math.floor(delta / 1000);
  return { days, hours, minutes, seconds };
}

/** Live countdown to the event date. Renders four elegant unit tiles. */
export function Countdown({ date }: { date: string }) {
  const target = React.useMemo(() => new Date(date).getTime(), [date]);
  // Tick on an interval; `null` until mounted to avoid a hydration mismatch.
  const [parts, setParts] = React.useState<ReturnType<typeof diff> | null>(null);

  React.useEffect(() => {
    const tick = () => setParts(diff(target));
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [target]);

  const units: { label: string; value: number | null }[] = [
    { label: "Days", value: parts?.days ?? null },
    { label: "Hours", value: parts?.hours ?? null },
    { label: "Minutes", value: parts?.minutes ?? null },
    { label: "Seconds", value: parts?.seconds ?? null },
  ];

  return (
    <div className="flex gap-2.5 sm:gap-3" aria-label="Countdown to your event">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex min-w-15 flex-1 flex-col items-center rounded-lg border border-white/25 bg-white/10 px-2 py-2.5 backdrop-blur-sm sm:min-w-16"
        >
          <span className="font-serif text-2xl font-medium tabular-nums text-white sm:text-3xl">
            {u.value === null ? "—" : String(u.value).padStart(2, "0")}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

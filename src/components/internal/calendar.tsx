"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { cn, formatDate } from "@/lib/utils";
import { type InternalEvent, STATUS_LABEL, STATUS_VARIANT, TODAY } from "@/lib/internal-data";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_DOT: Record<string, string> = {
  lead: "bg-info",
  booked: "bg-gold",
  planning: "bg-warning",
  "this-week": "bg-danger",
  completed: "bg-ink-muted",
};

export function Calendar({ events }: { events: InternalEvent[] }) {
  const [year, setYear] = React.useState(() => new Date(TODAY + "T00:00:00").getFullYear());
  const [month, setMonth] = React.useState(() => new Date(TODAY + "T00:00:00").getMonth());
  const [view, setView] = React.useState<"month" | "agenda">("month");

  const today = new Date(TODAY + "T00:00:00");

  const byDate = React.useMemo(() => {
    const map: Record<string, InternalEvent[]> = {};
    for (const e of events) {
      (map[e.date] ??= []).push(e);
    }
    return map;
  }, []);

  // Build the month grid (Mon-first).
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const iso = (d: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  const monthEvents = events
    .filter((e) => {
      const d = new Date(e.date + "T00:00:00");
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={prev} className="inline-flex size-9 items-center justify-center rounded-md border border-line-strong text-ink-soft hover:bg-ivory" aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </button>
          <h2 className="min-w-44 text-center font-serif text-lg text-ink">{MONTHS[month]} {year}</h2>
          <button onClick={next} className="inline-flex size-9 items-center justify-center rounded-md border border-line-strong text-ink-soft hover:bg-ivory" aria-label="Next month">
            <ChevronRight className="size-4" />
          </button>
        </div>
        <Tabs
          tabs={[{ value: "month", label: "Month" }, { value: "agenda", label: "Agenda" }]}
          value={view}
          onValueChange={(v) => setView(v as "month" | "agenda")}
          size="sm"
        />
      </div>

      {view === "month" ? (
        <div className="overflow-hidden rounded-lg border border-line bg-paper">
          <div className="grid grid-cols-7 border-b border-line bg-ivory text-center text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            {DOW.map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              const dateStr = d ? iso(d) : "";
              const dayEvents = d ? byDate[dateStr] ?? [] : [];
              const isToday =
                d != null &&
                year === today.getFullYear() &&
                month === today.getMonth() &&
                d === today.getDate();
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-22 border-b border-r border-line p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0",
                    d == null && "bg-ivory/40",
                  )}
                >
                  {d != null && (
                    <>
                      <div className="flex justify-end">
                        <span
                          className={cn(
                            "inline-flex size-6 items-center justify-center rounded-full text-xs",
                            isToday ? "bg-gold font-semibold text-on-accent" : "text-ink-soft",
                          )}
                        >
                          {d}
                        </span>
                      </div>
                      <div className="mt-0.5 space-y-1">
                        {dayEvents.slice(0, 3).map((e) => (
                          <Link
                            key={e.id}
                            href={e.id.startsWith("portal-") ? "/internal/clients" : `/internal/events/${e.id}`}
                            className="flex items-center gap-1 rounded bg-ivory px-1.5 py-0.5 text-[11px] leading-tight text-ink hover:bg-gold-soft"
                            title={`${e.client} — ${STATUS_LABEL[e.status]}`}
                          >
                            <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT[e.status])} />
                            <span className="truncate">{e.client}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-paper">
          {monthEvents.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-ink-muted">No events scheduled this month.</p>
          ) : (
            <ul className="divide-y divide-line">
              {monthEvents.map((e) => (
                <li key={e.id}>
                  <Link
                    href={e.id.startsWith("portal-") ? "/internal/clients" : `/internal/events/${e.id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-ivory/60"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={cn("size-2.5 shrink-0 rounded-full", STATUS_DOT[e.status])} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{e.client}</p>
                        <p className="truncate text-xs text-ink-muted">{e.type} · {e.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-ink-soft">{formatDate(e.date)}</p>
                      <Badge variant={STATUS_VARIANT[e.status]} className="mt-1">{STATUS_LABEL[e.status]}</Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
        {Object.entries(STATUS_LABEL).map(([k, label]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", STATUS_DOT[k])} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

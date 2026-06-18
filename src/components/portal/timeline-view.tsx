"use client";

import * as React from "react";
import { CalendarClock, User, CircleDashed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/portal/progress-bar";
import { MilestoneBadge, milestoneMeta } from "@/components/portal/status";
import { formatDate, cn } from "@/lib/utils";

type MilestoneStatus = "done" | "in-progress" | "pending" | "action-needed";

type Milestone = {
  id: string;
  title: string;
  description: string;
  due: string;
  status: MilestoneStatus;
  owner: "You" | "Jasminetals";
};

type Filter = "all" | MilestoneStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "action-needed", label: "Action needed" },
  { value: "in-progress", label: "In progress" },
  { value: "pending", label: "Pending" },
  { value: "done", label: "Done" },
];

const DOT: Record<MilestoneStatus, string> = {
  done: "bg-success text-white",
  "in-progress": "bg-info text-white",
  pending: "bg-line-strong text-ink-muted",
  "action-needed": "bg-warning text-white",
};

export function TimelineView({ milestones }: { milestones: Milestone[] }) {
  const [filter, setFilter] = React.useState<Filter>("all");

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: milestones.length };
    for (const m of milestones) c[m.status] = (c[m.status] ?? 0) + 1;
    return c;
  }, [milestones]);

  const doneCount = counts["done"] ?? 0;
  const pct = Math.round((doneCount / milestones.length) * 100);

  const visible = milestones.filter((m) => filter === "all" || m.status === filter);

  return (
    <div className="space-y-7">
      {/* Progress header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-xl font-medium text-ink">Planning progress</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {doneCount} of {milestones.length} milestones complete — we&rsquo;ve got the rest.
              </p>
            </div>
            <span className="font-serif text-3xl font-medium text-gold-dark">{pct}%</span>
          </div>
          <ProgressBar
            value={doneCount}
            max={milestones.length}
            tone="gold"
            className="mt-4"
            label="Milestones complete"
          />
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter milestones">
        {FILTERS.map((f) => {
          const active = filter === f.value;
          const count = counts[f.value] ?? 0;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ease-[var(--ease-elegant)]",
                active
                  ? "border-gold/40 bg-gold-soft text-gold-deep"
                  : "border-line-strong bg-paper text-ink-soft hover:border-gold/30 hover:text-ink",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active ? "bg-white/70 text-gold-deep" : "bg-ivory text-ink-muted",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      {visible.length === 0 ? (
        <EmptyState
          icon={CircleDashed}
          title="Nothing here yet"
          description="No milestones match this filter. Try another status."
        />
      ) : (
        <ol className="relative space-y-5 pl-2">
          {/* vertical rail */}
          <span
            className="absolute left-[18px] top-2 bottom-2 w-px bg-line"
            aria-hidden
          />
          {visible.map((m) => {
            const meta = milestoneMeta(m.status);
            const Icon = meta.icon;
            return (
              <li key={m.id} className="relative flex gap-4">
                <span
                  className={cn(
                    "relative z-10 mt-1 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-ivory",
                    DOT[m.status],
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <Card className="flex-1">
                  <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{m.title}</p>
                      <p className="mt-0.5 text-sm text-ink-soft">{m.description}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="size-3.5" />
                          Due {formatDate(m.due)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <User className="size-3.5" />
                          {m.owner === "You" ? "Owned by you" : "Jasminetals team"}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {m.owner === "You" && (
                        <Badge variant="gold">You</Badge>
                      )}
                      <MilestoneBadge status={m.status} />
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

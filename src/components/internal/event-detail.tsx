"use client";

import * as React from "react";
import {
  MapPin,
  Users,
  CalendarDays,
  Clock,
  FileText,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, formatINR, formatDate } from "@/lib/utils";
import {
  type InternalEvent,
  type Task,
  type RunOfShowItem,
  type BudgetLine,
  type Vendor,
  STATUS_LABEL,
  STATUS_VARIANT,
  PRIORITY_LABEL,
  PRIORITY_VARIANT,
  VENDOR_STATUS_VARIANT,
  VENDOR_CATEGORY_LABEL,
  ROS_TYPE_VARIANT,
  memberName,
} from "@/lib/internal-data";

export function EventDetail({
  event,
  eventTasks,
  ros,
  budget,
  assignedVendors,
}: {
  event: InternalEvent;
  eventTasks: Task[];
  ros: RunOfShowItem[];
  budget: BudgetLine[];
  assignedVendors: Vendor[];
}) {
  const [tab, setTab] = React.useState("overview");

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "timeline", label: "Timeline", count: ros.length },
    { value: "vendors", label: "Vendors", count: assignedVendors.length },
    { value: "tasks", label: "Tasks", count: eventTasks.length },
    { value: "budget", label: "Budget" },
    { value: "files", label: "Files" },
    { value: "messages", label: "Messages" },
  ];

  return (
    <div className="space-y-5">
      {/* Hero header */}
      <div className="overflow-hidden rounded-lg border border-line bg-paper">
        <div className="relative h-36 sm:h-44">
          <Photo seed={event.coverSeed} aspect="fill" className="absolute inset-0 h-full w-full" rounded="rounded-none" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex flex-wrap items-end justify-between gap-3 p-4">
            <div>
              <Badge variant={STATUS_VARIANT[event.status]} className="mb-2">{STATUS_LABEL[event.status]}</Badge>
              <h1 className="font-serif text-2xl text-white">{event.client}</h1>
              <p className="mt-0.5 text-sm text-white/80">{event.type} celebration</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-line border-t border-line sm:grid-cols-4">
          <Stat icon={CalendarDays} label="Date" value={formatDate(event.date)} />
          <Stat icon={MapPin} label="Location" value={event.location} />
          <Stat icon={Users} label="Guests" value={`${event.guests}`} />
          <Stat icon={null} label="Budget" value={formatINR(event.budget)} />
        </div>
      </div>

      {/* Assigned team */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-paper px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Assigned team</span>
        <div className="flex flex-wrap items-center gap-2">
          {event.assignedTeam.length ? (
            event.assignedTeam.map((id) => (
              <span key={id} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-ivory py-0.5 pl-0.5 pr-2.5 text-xs text-ink">
                <Avatar name={memberName(id)} size="sm" />
                {memberName(id)}
              </span>
            ))
          ) : (
            <span className="text-sm text-ink-muted">No team assigned yet</span>
          )}
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
            <Plus className="size-3.5" /> Assign
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} value={tab} onValueChange={setTab} size="sm" className="w-full overflow-x-auto" />

      {tab === "overview" && <Overview event={event} eventTasks={eventTasks} budget={budget} />}
      {tab === "timeline" && <Timeline ros={ros} />}
      {tab === "vendors" && <Vendors vendors={assignedVendors} />}
      {tab === "tasks" && <TasksList tasks={eventTasks} />}
      {tab === "budget" && <BudgetView budget={budget} total={event.budget} />}
      {tab === "files" && (
        <EmptyState icon={FileText} title="No files yet" description="Contracts, moodboards and floor plans for this event will appear here." action={<Button size="sm" variant="secondary">Upload files</Button>} />
      )}
      {tab === "messages" && (
        <EmptyState icon={MessageSquare} title="No messages" description="Internal and client messages for this event will appear here." action={<Button size="sm" variant="secondary">Start a thread</Button>} />
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }> | null;
  label: string;
  value: string;
}) {
  return (
    <div className="px-4 py-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
        {Icon && <Icon className="size-3.5" />} {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function Overview({ event, eventTasks, budget }: { event: InternalEvent; eventTasks: Task[]; budget: BudgetLine[] }) {
  const spent = budget.reduce((s, b) => s + b.spent, 0);
  const open = eventTasks.filter((t) => t.stage !== "done").length;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-lg border border-line bg-paper p-4">
        <h3 className="text-sm font-semibold text-ink">Brief</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {event.type} for {event.client} at {event.location}, hosting {event.guests} guests on {formatDate(event.date)}.
          Status: {STATUS_LABEL[event.status]}. A dedicated coordination team manages vendors, logistics and the run-of-show.
        </p>
      </div>
      <div className="rounded-lg border border-line bg-paper p-4">
        <h3 className="text-sm font-semibold text-ink">Open tasks</h3>
        <p className="mt-2 font-serif text-3xl text-ink">{open}</p>
        <p className="text-xs text-ink-muted">{eventTasks.length} total · {eventTasks.length - open} done</p>
      </div>
      <div className="rounded-lg border border-line bg-paper p-4">
        <h3 className="text-sm font-semibold text-ink">Budget used</h3>
        <p className="mt-2 font-serif text-3xl text-ink">{formatINR(spent)}</p>
        <p className="text-xs text-ink-muted">of {formatINR(event.budget)} allocated</p>
      </div>
    </div>
  );
}

function Timeline({ ros }: { ros: RunOfShowItem[] }) {
  if (!ros.length)
    return <EmptyState icon={Clock} title="No run-of-show yet" description="Build a time-blocked schedule for this event." action={<Button size="sm" variant="secondary">Add first block</Button>} />;
  return (
    <div className="rounded-lg border border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <h3 className="text-sm font-semibold text-ink">Run of show</h3>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"><Plus className="size-3.5" /> Add block</Button>
      </div>
      <ol className="divide-y divide-line">
        {ros.map((item, i) => (
          <li key={i} className="flex gap-4 px-4 py-3">
            <div className="w-16 shrink-0 text-right">
              <p className="font-medium text-ink tabular-nums">{item.time}</p>
              <p className="text-[11px] text-ink-muted">{item.duration}</p>
            </div>
            <div className="relative flex-1 border-l border-line pl-4">
              <span className={cn("absolute -left-[5px] top-1.5 size-2.5 rounded-full ring-2 ring-paper", dotColor(item.type))} />
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-ink">{item.title}</p>
                <Badge variant={ROS_TYPE_VARIANT[item.type]} className="capitalize">{item.type}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">Owner: {item.owner}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function dotColor(type: RunOfShowItem["type"]) {
  return {
    ceremony: "bg-gold",
    vendor: "bg-info",
    catering: "bg-success",
    logistics: "bg-warning",
    other: "bg-ink-muted",
  }[type];
}

function Vendors({ vendors }: { vendors: Vendor[] }) {
  if (!vendors.length) return <EmptyState icon={Users} title="No vendors assigned" />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {vendors.map((v) => (
        <div key={v.id} className="rounded-lg border border-line bg-paper p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-ink">{v.name}</p>
              <p className="text-xs text-ink-muted">{VENDOR_CATEGORY_LABEL[v.category]} · {v.contact}</p>
            </div>
            <Badge variant={VENDOR_STATUS_VARIANT[v.status]} className="capitalize">{v.status}</Badge>
          </div>
          <p className="mt-2 text-xs text-ink-soft">{v.phone}</p>
        </div>
      ))}
    </div>
  );
}

function TasksList({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) return <EmptyState icon={FileText} title="No tasks for this event" />;
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-paper">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-4 py-2.5 font-medium">Task</th>
            <th className="px-4 py-2.5 font-medium">Assignee</th>
            <th className="px-4 py-2.5 font-medium">Due</th>
            <th className="px-4 py-2.5 font-medium">Priority</th>
            <th className="px-4 py-2.5 font-medium">Stage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {tasks.map((t) => (
            <tr key={t.id} className="hover:bg-ivory/60">
              <td className="px-4 py-3 font-medium text-ink">{t.title}</td>
              <td className="px-4 py-3 text-ink-soft">{t.assignee}</td>
              <td className="px-4 py-3 text-ink-soft">{formatDate(t.due)}</td>
              <td className="px-4 py-3"><Badge variant={PRIORITY_VARIANT[t.priority]}>{PRIORITY_LABEL[t.priority]}</Badge></td>
              <td className="px-4 py-3 capitalize text-ink-soft">{t.stage.replace("-", " ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BudgetView({ budget, total }: { budget: BudgetLine[]; total: number }) {
  if (!budget.length)
    return <EmptyState icon={FileText} title="No budget breakdown" description="Add allocation lines to track spend." />;
  const spent = budget.reduce((s, b) => s + b.spent, 0);
  const alloc = budget.reduce((s, b) => s + b.allocated, 0);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Summary label="Allocated" value={formatINR(alloc)} />
        <Summary label="Spent" value={formatINR(spent)} />
        <Summary label="Remaining" value={formatINR(total - spent)} accent />
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 text-right font-medium">Allocated</th>
              <th className="px-4 py-2.5 text-right font-medium">Spent</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {budget.map((b) => {
              const pct = Math.min(100, Math.round((b.spent / b.allocated) * 100));
              return (
                <tr key={b.category} className="hover:bg-ivory/60">
                  <td className="px-4 py-3 font-medium text-ink">{b.category}</td>
                  <td className="px-4 py-3 text-right text-ink-soft">{formatINR(b.allocated)}</td>
                  <td className="px-4 py-3 text-right text-ink-soft">{formatINR(b.spent)}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                        <div className={cn("h-full rounded-full", pct >= 100 ? "bg-danger" : "bg-gold")} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-9 text-right text-xs tabular-nums text-ink-muted">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Summary({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg border bg-paper p-4", accent ? "border-gold/40 bg-gold-tint" : "border-line")}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={cn("mt-1 font-serif text-xl", accent ? "text-gold-deep" : "text-ink")}>{value}</p>
    </div>
  );
}

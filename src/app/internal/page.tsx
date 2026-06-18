import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp, ArrowRight, MapPin, UserPlus, Phone, Mail } from "lucide-react";
import { getServerSession } from "@/lib/server-auth";
import { QuickLinks } from "@/components/internal/quick-links";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/internal/page-header";
import { Button } from "@/components/ui/button";
import { cn, formatINR, formatDate } from "@/lib/utils";
import {
  pipeline,
  kpis,
  auditLog,
  STATUS_LABEL,
  STATUS_VARIANT,
  memberName,
  TODAY,
} from "@/lib/internal-data";
import {
  listEvents,
  listLeads,
  listClientAssignments,
  clientAssignmentToEvent,
} from "@/lib/store";

function relativeTime(iso: string) {
  const now = new Date(TODAY + "T12:00:00").getTime();
  const then = new Date(iso).getTime();
  const mins = Math.round((now - then) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default async function DashboardPage() {
  // The studio-wide dashboard (KPIs, all leads, revenue, audit) is owner-admin
  // only. A team member is sent to their own scoped workspace instead.
  const session = await getServerSession();
  if (session?.role === "team") redirect("/internal/team-access");

  const [storedEvents, allLeads, assignments] = await Promise.all([
    listEvents(),
    listLeads(),
    listClientAssignments(),
  ]);
  const newLeads = allLeads.filter((l) => l.status === "new");

  // Live events from the store + promoted portal clients (both kinds carry a
  // date/status/team, so they share the upcoming list and this-week strip).
  const allEvents = [...storedEvents, ...assignments.map(clientAssignmentToEvent)];
  const upcoming = allEvents
    .filter((e) => e.date >= TODAY)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  const events = allEvents; // used in "this-week" strip below

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Studio overview · Monday, 15 June 2026">
        <Button size="sm" variant="secondary" href="/internal/calendar">
          View calendar
        </Button>
        <Button size="sm" href="/internal/events">
          All events
        </Button>
      </PageHeader>

      <QuickLinks />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.id} className="rounded-lg border border-line bg-paper p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{k.label}</p>
            <p className="mt-1.5 font-serif text-2xl text-ink">{k.value}</p>
            <p
              className={cn(
                "mt-1 inline-flex items-center gap-1 text-xs",
                k.trend === "up" ? "text-success" : "text-ink-muted",
              )}
            >
              {k.trend === "up" && <TrendingUp className="size-3.5" />}
              {k.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Pipeline columns */}
      <section>
        <h2 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Events pipeline
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {pipeline.map((stage) => (
            <div key={stage.status} className="rounded-lg border border-line bg-paper p-4">
              <div className="flex items-center justify-between">
                <Badge variant={STATUS_VARIANT[stage.status]} dot>
                  {stage.label}
                </Badge>
                <span className="font-serif text-xl text-ink">{stage.count}</span>
              </div>
              <p className="mt-3 text-xs text-ink-muted">Pipeline value</p>
              <p className="text-sm font-medium text-ink">{formatINR(stage.value)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* New leads */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              New Leads
            </h2>
            {newLeads.length > 0 && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-on-accent">
                {newLeads.length}
              </span>
            )}
          </div>
          <Link
            href="/internal/events"
            className="inline-flex items-center gap-1 text-xs font-medium text-gold-dark hover:underline"
          >
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {newLeads.length === 0 ? (
          <div className="flex items-center gap-3 rounded-lg border border-line bg-paper px-5 py-4 text-sm text-ink-muted">
            <UserPlus className="size-4 shrink-0" />
            No new leads right now — all enquiries are followed up.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-paper">
            <ul className="divide-y divide-line">
              {newLeads.map((lead) => (
                <li key={lead.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5">
                  <Avatar name={lead.name} size="md" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{lead.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                        <Mail className="size-3" />
                        {lead.email}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                        <Phone className="size-3" />
                        {lead.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="gold">{lead.eventType}</Badge>
                    {lead.budget && (
                      <span className="hidden text-xs text-ink-muted sm:block">{lead.budget}</span>
                    )}
                    <span className="text-xs text-ink-muted">{relativeTime(lead.submittedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming events table */}
        <section className="lg:col-span-2">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Upcoming events
            </h2>
            <Link href="/internal/events" className="inline-flex items-center gap-1 text-xs font-medium text-gold-dark hover:underline">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-paper">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Client</th>
                  <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Date</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="hidden px-4 py-2.5 text-right font-medium md:table-cell">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {upcoming.map((e) => (
                  <tr key={e.id} className="transition-colors hover:bg-ivory/60">
                    <td className="px-4 py-3">
                      <Link
                        href={e.id.startsWith("portal-") ? "/internal/clients" : `/internal/events/${e.id}`}
                        className="font-medium text-ink hover:text-gold-dark"
                      >
                        {e.client}
                      </Link>
                      <p className="text-xs text-ink-muted">{e.type} · {e.guests} guests</p>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-soft sm:table-cell">{formatDate(e.date)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                    </td>
                    <td className="hidden px-4 py-3 text-right font-medium text-ink md:table-cell">
                      {formatINR(e.budget)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Activity feed */}
        <section>
          <h2 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            Recent activity
          </h2>
          <div className="rounded-lg border border-line bg-paper">
            <ul className="divide-y divide-line">
              {auditLog.slice(0, 8).map((a) => (
                <li key={a.id} className="flex gap-3 px-4 py-3">
                  <Avatar name={a.who} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-ink">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-ink-soft">{a.action.toLowerCase()}</span>
                    </p>
                    <p className="truncate text-xs text-ink-muted">{a.target}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-ink-muted">{relativeTime(a.when)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-4 py-2.5">
              <Link href="/internal/audit" className="inline-flex items-center gap-1 text-xs font-medium text-gold-dark hover:underline">
                Full audit log <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* This-week strip */}
      <section>
        <h2 className="mb-2.5 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          On deck this week
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {events.filter((e) => e.status === "this-week").map((e) => (
            <Link
              key={e.id}
              href={e.id.startsWith("portal-") ? "/internal/clients" : `/internal/events/${e.id}`}
              className="group flex items-center justify-between rounded-lg border border-line bg-paper p-4 transition-colors hover:border-gold/40"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink group-hover:text-gold-dark">{e.client}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="size-3.5" /> {e.location}
                </p>
                <div className="mt-2 flex -space-x-1.5">
                  {e.assignedTeam.map((id) => (
                    <Avatar key={id} name={memberName(id)} size="sm" className="ring-2 ring-paper" />
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-ink">{formatDate(e.date)}</p>
                <Badge variant={STATUS_VARIANT[e.status]} className="mt-1">{STATUS_LABEL[e.status]}</Badge>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

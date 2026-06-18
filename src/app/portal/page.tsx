import { cookies } from "next/headers";
import Link from "next/link";
import {
  CalendarClock,
  Wallet,
  CircleDashed,
  FileText,
  MapPin,
  Users,
  Calendar,
  ArrowUpRight,
  TriangleAlert,
  MessagesSquare,
  CircleCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { Avatar } from "@/components/ui/avatar";
import { Countdown } from "@/components/portal/countdown";
import { ProgressBar } from "@/components/portal/progress-bar";
import { MilestoneBadge } from "@/components/portal/status";
import { formatDate, formatINR, cn, numberToWords } from "@/lib/utils";
import {
  milestones as demoMilestones,
  budget as demoBudget,
  documents as demoDocuments,
  messages as demoMessages,
  planner,
} from "@/lib/portal-data";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  getClientAssignment,
  getClientPortalData,
  seedClientPortalData,
  listTasksForEvent,
  type ClientMilestone,
  type ClientPortalMessage,
  type Task,
} from "@/lib/store";

const DAY = 86_400_000;

export default async function OverviewPage() {
  // ── Resolve real data for the logged-in client ──
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );

  const isRealClient = session?.role === "client" && !!session.email;

  const [assignment, portalData, clientTasks] = await Promise.all([
    isRealClient ? getClientAssignment(session!.email!) : Promise.resolve(null),
    isRealClient ? getClientPortalData(session!.email!) : Promise.resolve(null),
    isRealClient ? listTasksForEvent(`portal-${session!.email!}`) : Promise.resolve([] as Task[]),
  ]);

  const clientName = assignment?.name ?? session?.name ?? "Aanya Mehra";

  // Milestones + budget: real client portal data, fallback to demo seed, then demo static
  const milestones: ClientMilestone[] = isRealClient
    ? (portalData?.milestones ?? (assignment ? seedClientPortalData(assignment).milestones : demoMilestones))
    : demoMilestones;

  const budgetData = isRealClient
    ? (portalData?.budget ?? (assignment ? seedClientPortalData(assignment).budget : demoBudget))
    : demoBudget;

  const messages: ClientPortalMessage[] = isRealClient
    ? (portalData?.messages ?? (assignment ? seedClientPortalData(assignment).messages : demoMessages))
    : demoMessages;

  const documents = isRealClient ? [] : demoDocuments;

  const event = assignment
    ? {
        name: assignment.eventName,
        type: assignment.eventType,
        date: assignment.eventDate,
        venue: assignment.venue,
        location: assignment.location,
        status: "Planning",
        coverSeed: assignment.eventName,
        guestCount: assignment.guestCount ? Number(assignment.guestCount) || 0 : 0,
      }
    : {
        // demo fallback (admin preview)
        name: "Aanya & Vikram",
        type: "Lakeside Wedding",
        date: "2026-11-21",
        venue: "Taj Lake Palace",
        location: "Udaipur, Rajasthan",
        status: "Planning",
        coverSeed: "lakeside-wedding",
        guestCount: 220,
      };

  // ── Compute stats ──
  const today = new Date().getTime();
  const eventDay = new Date(event.date).getTime();
  const daysToGo = Math.max(0, Math.round((eventDay - today) / DAY));

  const totalSpent = budgetData.lines.reduce((s, l) => s + l.spent, 0);
  const budgetTotal = budgetData.total;
  const budgetPct = budgetTotal > 0 ? Math.round((totalSpent / budgetTotal) * 100) : 0;

  // Milestone-based counts (portal timeline)
  const actionItems = milestones.filter((m) => m.status === "action-needed");
  const doneCount = milestones.filter((m) => m.status === "done").length;

  // Real tasks assigned to this client's event
  const pendingTasks = clientTasks.filter((t) => t.stage !== "done");
  const tasksPending = isRealClient ? pendingTasks.length : milestones.filter((m) => m.status !== "done").length;

  const recent = [...messages]
    .sort((a, b) => +new Date(b.time) - +new Date(a.time))
    .slice(0, 3);

  const plannerDisplayName = planner.name;

  const kpis = [
    {
      label: "Days to go",
      value: String(daysToGo),
      sub: formatDate(event.date),
      icon: CalendarClock,
      href: "/portal/timeline",
    },
    {
      label: "Budget used",
      value: `${budgetPct}%`,
      sub: budgetTotal > 0 ? `${formatINR(totalSpent)} of ${formatINR(budgetTotal)}` : "Budget TBD",
      icon: Wallet,
      href: "/portal/budget",
    },
    {
      label: "Tasks pending",
      value: String(tasksPending),
      sub: isRealClient && clientTasks.length > 0
        ? `${clientTasks.filter((t) => t.stage === "done").length} of ${clientTasks.length} done`
        : `${doneCount} of ${milestones.length} milestones done`,
      icon: CircleDashed,
      href: "/portal/timeline",
    },
    {
      label: "Documents",
      value: documents.length > 0 ? String(documents.length) : "0",
      sub: documents.length > 0 ? "Contracts & invoices" : "Coming soon",
      icon: FileText,
      href: "/portal/documents",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero overview card */}
      <Reveal as="section">
        <Card className="overflow-hidden">
          <div className="relative">
            <Photo
              seed={event.coverSeed}
              aspect="21/9"
              rounded="rounded-none"
              priority
              className="min-h-56 sm:min-h-64"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
              <div className="max-w-md">
                <Badge variant="gold" dot className="mb-3 bg-white/90 backdrop-blur-sm">
                  {event.status}
                </Badge>
                <h2 className="font-serif text-3xl font-medium leading-tight text-white sm:text-4xl">
                  {event.name}
                </h2>
                <p className="mt-1.5 text-sm text-white/85">
                  {event.type} · {event.venue}, {event.location.split(",")[0]}
                </p>
              </div>
              <Countdown date={event.date} />
            </div>
          </div>

          <CardContent className="grid grid-cols-2 gap-px overflow-hidden rounded-b-lg bg-line p-0 sm:grid-cols-4">
            {[
              { icon: Calendar, label: "Date", value: formatDate(event.date) },
              { icon: MapPin, label: "Location", value: event.location },
              {
                icon: Users,
                label: "Guests",
                value: event.guestCount ? `${event.guestCount} invited` : "TBD",
              },
              {
                icon: CircleCheck,
                label: "Progress",
                value: `${doneCount}/${milestones.length} milestones`,
              },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3 bg-paper p-5">
                <f.icon className="mt-0.5 size-[18px] shrink-0 text-gold-dark" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    {f.label}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-ink">{f.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <Reveal key={kpi.label} delay={i * 60}>
            <Link href={kpi.href} className="group block h-full">
              <Card hover className="h-full">
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
                      <kpi.icon className="size-[18px]" />
                    </span>
                    <ArrowUpRight className="size-4 text-ink-muted transition-colors group-hover:text-gold-dark" />
                  </div>
                  <div>
                    <p className="font-serif text-3xl font-medium leading-none text-ink">
                      {kpi.value}
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-ink">{kpi.label}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-soft">{kpi.sub}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </Reveal>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Needs attention */}
        <Reveal className="lg:col-span-2" as="section">
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-warning-soft text-warning">
                    <TriangleAlert className="size-[17px]" />
                  </span>
                  <h3 className="font-serif text-lg font-medium text-ink">
                    What needs your attention
                  </h3>
                </div>
                <Button href="/portal/timeline" variant="link" size="sm">
                  View timeline
                </Button>
              </div>

              {actionItems.length === 0 && pendingTasks.length === 0 ? (
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-line-strong bg-ivory/60 px-5 py-8 text-center">
                  <p className="mx-auto text-sm text-ink-soft">
                    You&rsquo;re all caught up — nothing needs you right now.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {actionItems.map((m) => (
                    <li
                      key={m.id}
                      className="flex flex-col gap-3 rounded-lg border border-line bg-ivory/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{m.title}</p>
                        <p className="mt-0.5 text-sm text-ink-soft">{m.description}</p>
                        <p className="mt-1.5 text-xs text-ink-muted">Due {formatDate(m.due)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <MilestoneBadge status={m.status} />
                        <Button href="/portal/timeline" variant="secondary" size="sm">Review</Button>
                      </div>
                    </li>
                  ))}
                  {pendingTasks.map((t) => {
                    const STAGE_COLORS: Record<string, string> = {
                      todo: "bg-ivory text-ink-soft",
                      "in-progress": "bg-info-soft text-info",
                      review: "bg-warning-soft text-warning",
                    };
                    return (
                      <li
                        key={t.id}
                        className="flex flex-col gap-3 rounded-lg border border-line bg-ivory/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{t.title}</p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            Assigned to {t.assignee} · Due {formatDate(t.due)}
                          </p>
                        </div>
                        <span className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                          STAGE_COLORS[t.stage] ?? "bg-ivory text-ink-soft",
                        )}>
                          {t.stage === "in-progress" ? "In progress" : t.stage === "todo" ? "To do" : "In review"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </Reveal>

        {/* Budget snapshot + recent activity */}
        <Reveal delay={80} className="space-y-6" as="section">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-serif text-lg font-medium text-ink">Budget snapshot</h3>
              <p className="mt-1 text-sm text-ink-soft">
                {budgetTotal > 0
                  ? `${formatINR(totalSpent)} spent of ${formatINR(budgetTotal)}`
                  : "Budget to be confirmed with your planner"}
              </p>
              {budgetTotal > 0 && (
                <p className="mt-0.5 text-xs text-gold-dark">{numberToWords(budgetTotal)}</p>
              )}
              {budgetTotal > 0 && (
                <>
                  <ProgressBar
                    value={totalSpent}
                    max={budgetTotal}
                    tone="gold"
                    className="mt-4"
                    label="Budget used"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                    <span>{budgetPct}% used</span>
                    <span>{formatINR(budgetTotal - totalSpent)} remaining</span>
                  </div>
                </>
              )}
              <Button href="/portal/budget" variant="secondary" size="sm" className="mt-5 w-full">
                Open budget tracker
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <MessagesSquare className="size-[18px] text-gold-dark" />
                <h3 className="font-serif text-lg font-medium text-ink">Recent activity</h3>
              </div>
              <ul className="space-y-4">
                {recent.map((m) => (
                  <li key={m.id} className="flex gap-3">
                    <Avatar
                      name={m.from === "you" ? clientName : plannerDisplayName}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-ink">{m.author}</span>{" "}
                        <span className="text-ink-muted">· {formatDate(m.time)}</span>
                      </p>
                      <p className={cn("mt-0.5 line-clamp-2 text-sm text-ink-soft")}>
                        {m.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Button href="/portal/messages" variant="link" size="sm" className="mt-4">
                Open messages
              </Button>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

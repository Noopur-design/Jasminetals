import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  CalendarDays,
  ListChecks,
  Store,
  StickyNote,
  Phone,
  Lock,
} from "lucide-react";
import { QuickLinks } from "@/components/internal/quick-links";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PageHeader } from "@/components/internal/page-header";
import { cn, formatDate } from "@/lib/utils";
import {
  memberById,
  vendors,
  internalNotes,
  STATUS_LABEL,
  STATUS_VARIANT,
  PRIORITY_LABEL,
  PRIORITY_VARIANT,
  VENDOR_CATEGORY_LABEL,
} from "@/lib/internal-data";
import {
  listEvents,
  listTasks,
  listClientAssignments,
  clientAssignmentToEvent,
} from "@/lib/store";
import { requireStaff } from "@/lib/server-auth";
import { MODULES, MODULE_LABELS, can, type Module } from "@/lib/permissions";

export const metadata = { title: "My Workspace" };

export default async function TeamAccessPage() {
  // Identity comes from the SIGNED SESSION — never a hardcoded member — so each
  // team member only ever sees their own scoped workspace.
  const session = await requireStaff();
  if (!session) redirect("/login");

  const seedMe = memberById(session.uid);
  const me = {
    id: session.uid,
    name: session.name || seedMe?.name || "Team member",
    role: seedMe?.role ?? "Team member",
    assignedEvents: seedMe?.assignedEvents ?? [],
  };

  const [storedEvents, storedTasks, assignments] = await Promise.all([
    listEvents(),
    listTasks(),
    listClientAssignments(),
  ]);

  // My events = live events I'm assigned to (via the event's assignedTeam or my
  // own roster list) + portal clients whose team includes me. Always live, and
  // portal events are no longer invisible to a scoped team member.
  const liveEvents = storedEvents.filter(
    (e) => (e.assignedTeam ?? []).includes(me.id) || me.assignedEvents.includes(e.id),
  );
  const myPortalEvents = assignments
    .filter((a) => (a.assignedTeam ?? []).includes(me.id))
    .map(clientAssignmentToEvent);
  const myEvents = [...liveEvents, ...myPortalEvents];
  const myEventIds = new Set(myEvents.map((e) => e.id));
  const eventLabel = (id: string) => myEvents.find((e) => e.id === id)?.client;

  // Module visibility comes from the session's admin-granted permissions.
  const canView = (m: Module) => can(session.role, session.permissions, m, "view");

  const myTasks = storedTasks
    .filter((t) => myEventIds.has(t.eventId))
    .sort((a, b) => a.due.localeCompare(b.due));

  // Vendors relevant to assigned events (design-only: preferred + confirmed pool).
  const myVendors = vendors.filter((v) => v.status !== "pending").slice(0, 6);

  const myNotes = internalNotes
    .filter((n) => myEventIds.has(n.eventId))
    .sort((a, b) => b.when.localeCompare(a.when));

  return (
    <div className="space-y-5">
      <PageHeader title="My Workspace" subtitle={`Scoped view · ${me.name} · ${me.role}`} />

      <QuickLinks />

      {/* Scope banner */}
      <div className="flex items-start gap-3 rounded-lg border border-gold/30 bg-gold-tint px-4 py-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-dark" />
        <div className="text-sm">
          <p className="font-medium text-ink">This is your scoped team view.</p>
          <p className="mt-0.5 text-ink-soft">
            You only see events you are assigned to and the modules you have access to.
            Anything outside your permissions is hidden.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MODULES.map((m) => {
              const allowed = canView(m);
              return (
                <span
                  key={m}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                    allowed
                      ? "border-success/30 bg-success-soft text-success"
                      : "border-line-strong bg-ivory text-ink-muted line-through",
                  )}
                >
                  {!allowed && <Lock className="size-2.5" />} {MODULE_LABELS[m]}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* My events */}
      <Section icon={CalendarDays} title="My events" count={myEvents.length}>
        <div className="grid gap-3 sm:grid-cols-2">
          {myEvents.map((e) => (
            <Link
              key={e.id}
              href={`/internal/events/${e.id}`}
              className="group rounded-lg border border-line bg-paper p-4 transition-colors hover:border-gold/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-ink group-hover:text-gold-dark">{e.client}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-muted">
                    <MapPin className="size-3.5" /> {e.location}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[e.status]}>{STATUS_LABEL[e.status]}</Badge>
              </div>
              <p className="mt-2 text-xs text-ink-soft">{e.type} · {formatDate(e.date)} · {e.guests} guests</p>
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* My tasks */}
        <Section icon={ListChecks} title="My tasks" count={myTasks.length}>
          <div className="overflow-hidden rounded-lg border border-line bg-paper">
            <ul className="divide-y divide-line">
              {myTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                      <p className="truncate text-xs text-ink-muted">{eventLabel(t.eventId)} · due {formatDate(t.due)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={PRIORITY_VARIANT[t.priority]}>{PRIORITY_LABEL[t.priority]}</Badge>
                      <span className="hidden text-xs capitalize text-ink-soft sm:inline">{t.stage.replace("-", " ")}</span>
                    </div>
                  </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* My schedule (agenda) */}
        <Section icon={CalendarDays} title="My schedule" count={myEvents.length}>
          <div className="overflow-hidden rounded-lg border border-line bg-paper">
            <ul className="divide-y divide-line">
              {myEvents
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{e.client}</p>
                      <p className="truncate text-xs text-ink-muted">{e.type}</p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-soft">{formatDate(e.date)}</span>
                  </li>
                ))}
            </ul>
          </div>
        </Section>
      </div>

      {/* Vendor contacts */}
      <Section icon={Store} title="Vendor contacts" count={myVendors.length}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {myVendors.map((v) => (
            <div key={v.id} className="rounded-lg border border-line bg-paper p-4">
              <p className="font-medium text-ink">{v.name}</p>
              <p className="text-xs text-ink-muted">{VENDOR_CATEGORY_LABEL[v.category]} · {v.contact}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <Phone className="size-3.5 text-ink-muted" /> {v.phone}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Internal notes */}
      <Section icon={StickyNote} title="Internal notes" count={myNotes.length}>
        <div className="space-y-2.5">
          {myNotes.map((n) => (
            <div key={n.id} className="rounded-lg border border-line bg-paper p-4">
                <div className="flex items-center gap-2">
                  <Avatar name={n.author} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-ink">{n.author}</p>
                    <p className="text-xs text-ink-muted">{eventLabel(n.eventId)} · {formatDate(n.when)}</p>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{n.body}</p>
              </div>
          ))}
        </div>
      </Section>

      {/* Note: Clients & Budget modules intentionally absent for this role. */}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2.5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
        <Icon className="size-4 text-gold-dark" /> {title}
        <span className="rounded-full bg-line px-2 text-xs font-semibold text-ink-muted">{count}</span>
      </h2>
      {children}
    </section>
  );
}

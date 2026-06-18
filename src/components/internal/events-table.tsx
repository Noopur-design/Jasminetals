"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Inbox,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  UserPlus,
  ListChecks,
  ScrollText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Label } from "@/components/ui/field";
import { formatINR, formatDate, cn, numberToWords, parseBudgetNumber } from "@/lib/utils";
import {
  STATUS_LABEL,
  STATUS_VARIANT,
  memberName,
  teamMembers,
  TODAY,
  type EventStatus,
  type InternalEvent,
  type Lead,
} from "@/lib/internal-data";
import type { ClientAssignment } from "@/lib/store";

type Filter = "all" | EventStatus | "lead";

const TYPES = ["Wedding", "Corporate", "Social Celebration", "Birthday", "Destination"];
const STATUSES = Object.keys(STATUS_LABEL) as EventStatus[];
const SEED_BY_TYPE: Record<string, string> = {
  Wedding: "udaipur-lake-wedding",
  Corporate: "corporate-launch-keynote",
  "Social Celebration": "anniversary-garden-soiree",
  Birthday: "birthday-balloon-arch",
  Destination: "destination-beach-ceremony",
};

type BadgeVariant = "gold" | "info" | "success" | "warning" | "neutral" | "danger";

const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
  converted: "Booked",
};
const LEAD_STATUS_VARIANT: Record<string, BadgeVariant> = {
  new: "gold",
  contacted: "info",
  qualified: "success",
  closed: "neutral",
  converted: "success",
};

function relTime(iso: string) {
  const now = new Date(TODAY + "T12:00:00").getTime();
  const then = new Date(iso).getTime();
  const mins = Math.round((now - then) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// ── Unified row type ────────────────────────────────────────
type URow = {
  id: string;
  kind: "event" | "lead" | "portal";
  name: string;
  email?: string;
  phone?: string;
  eventLabel: string;
  eventSub?: string;
  date?: string;
  budgetLabel: string;
  statusLabel: string;
  statusVariant: BadgeVariant;
  timeLabel: string;
  lead?: Lead;
  event?: InternalEvent;
  portal?: ClientAssignment;
};

function eventToRow(e: InternalEvent): URow {
  return {
    id: e.id,
    kind: "event",
    name: e.client,
    eventLabel: e.type,
    eventSub: e.location,
    date: e.date,
    budgetLabel: formatINR(e.budget),
    statusLabel: STATUS_LABEL[e.status],
    statusVariant: STATUS_VARIANT[e.status] as BadgeVariant,
    timeLabel: formatDate(e.date),
    event: e,
  };
}

function leadToRow(l: Lead): URow {
  return {
    id: l.id,
    kind: "lead",
    name: l.name,
    email: l.email,
    phone: l.phone,
    eventLabel: l.eventType,
    date: l.eventDate,
    budgetLabel: l.budget ?? "—",
    statusLabel: LEAD_STATUS_LABEL[l.status] ?? l.status,
    statusVariant: LEAD_STATUS_VARIANT[l.status] ?? "neutral",
    timeLabel: relTime(l.submittedAt),
    lead: l,
  };
}

const PORTAL_STATUS_LABEL: Record<string, string> = {
  booked: "Booked",
  planning: "Planning",
  "this-week": "This Week",
  completed: "Completed",
};
const PORTAL_STATUS_VARIANT: Record<string, BadgeVariant> = {
  booked: "success",
  planning: "info",
  "this-week": "warning",
  completed: "neutral",
};

function portalToRow(p: ClientAssignment): URow {
  const ps = p.portalStatus ?? "booked";
  return {
    id: `portal-${p.email}`,
    kind: "portal",
    name: p.name,
    email: p.email,
    phone: p.phone,
    eventLabel: p.eventName,
    eventSub: `${p.eventType} · ${p.venue}, ${p.location}`,
    date: p.eventDate,
    budgetLabel: p.budget ?? "—",
    statusLabel: PORTAL_STATUS_LABEL[ps] ?? "Booked",
    statusVariant: PORTAL_STATUS_VARIANT[ps] ?? "success",
    timeLabel: relTime(p.assignedAt),
    portal: p,
  };
}

export function EventsTable() {
  const [events, setEvents] = React.useState<InternalEvent[]>([]);
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [portals, setPortals] = React.useState<ClientAssignment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [query, setQuery] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<InternalEvent | null>(null);
  const [editingPortal, setEditingPortal] = React.useState<ClientAssignment | null>(null);
  const [promoteTarget, setPromoteTarget] = React.useState<Lead | null>(null);
  const [assignLeadTarget, setAssignLeadTarget] = React.useState<Lead | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, ldRes, ptRes] = await Promise.all([
        fetch("/api/admin/events", { cache: "no-store" }),
        fetch("/api/admin/leads", { cache: "no-store" }),
        fetch("/api/admin/client-assignments", { cache: "no-store" }),
      ]);
      const evData = await evRes.json();
      const ldData = await ldRes.json();
      const ptData = ptRes.ok ? await ptRes.json() : {};
      setEvents(evData.events ?? []);
      setLeads(ldData.leads ?? []);
      setPortals(ptData.assignments ?? []);
    } catch {
      setEvents([]); setLeads([]); setPortals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "1") {
      setEditing(null);
      setModalOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // ── Build unified rows ──────────────────────────────────
  const activeLeads = React.useMemo(
    () => leads.filter((l) => l.status !== "converted" && l.status !== "closed"),
    [leads],
  );

  // Portal clients shown in Booked — exclude any whose name already has a booked InternalEvent
  const bookedEventNames = React.useMemo(
    () => new Set(events.filter((e) => e.status === "booked").map((e) => e.client.toLowerCase())),
    [events],
  );
  const portalRows = React.useMemo(
    () => portals.filter((p) => !bookedEventNames.has(p.name.toLowerCase())),
    [portals, bookedEventNames],
  );

  const allRows = React.useMemo<URow[]>(() => {
    const rows: URow[] = [
      ...activeLeads.map(leadToRow),
      ...portalRows.map(portalToRow),
      ...events.map(eventToRow),
    ];
    return rows.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date.localeCompare(b.date);
    });
  }, [activeLeads, portalRows, events]);

  const counts = React.useMemo(() => {
    const c: Record<string, number> = {};
    c.all = activeLeads.length + portalRows.length + events.length;
    c.lead = activeLeads.length;
    for (const s of ["booked", "planning", "this-week", "completed"] as EventStatus[]) {
      const evCount = events.filter((e) => e.status === s).length;
      const ptCount = portalRows.filter((p) => (p.portalStatus ?? "booked") === s).length;
      c[s] = evCount + ptCount;
    }
    return c;
  }, [activeLeads, portalRows, events]);

  const filteredRows = React.useMemo<URow[]>(() => {
    let rows: URow[];
    switch (filter) {
      case "lead":   rows = allRows.filter((r) => r.kind === "lead"); break;
      case "booked": rows = allRows.filter((r) =>
        (r.kind === "portal" && (r.portal!.portalStatus ?? "booked") === "booked") ||
        (r.kind === "event" && r.event?.status === "booked")); break;
      case "planning": rows = allRows.filter((r) =>
        (r.kind === "portal" && r.portal!.portalStatus === "planning") ||
        (r.kind === "event" && r.event?.status === "planning")); break;
      case "this-week": rows = allRows.filter((r) =>
        (r.kind === "portal" && r.portal!.portalStatus === "this-week") ||
        (r.kind === "event" && r.event?.status === "this-week")); break;
      case "completed": rows = allRows.filter((r) =>
        (r.kind === "portal" && r.portal!.portalStatus === "completed") ||
        (r.kind === "event" && r.event?.status === "completed")); break;
      default: rows = allRows;
    }
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.eventLabel.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.eventSub?.toLowerCase().includes(q),
    );
  }, [allRows, filter, query]);

  async function handleDeleteEvent(ev: InternalEvent) {
    if (!confirm(`Delete "${ev.client}"? This can't be undone.`)) return;
    await fetch(`/api/admin/events/${ev.id}`, { method: "DELETE" });
    await load();
  }

  async function handleDeletePortal(p: ClientAssignment) {
    if (!confirm(`Remove "${p.name}" from portal clients? This will revoke their portal access. This can't be undone.`)) return;
    await fetch(`/api/admin/client-assignments/${encodeURIComponent(p.email)}`, { method: "DELETE" });
    await load();
  }

  async function markContacted(lead: Lead) {
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, status: "contacted" }),
    });
    await load();
  }

  async function handleDeleteLead(lead: Lead) {
    if (!confirm(`Delete enquiry from "${lead.name}"? This can't be undone.`)) return;
    await fetch("/api/admin/leads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id }),
    });
    await load();
  }

  const openCreate = () => { setEditing(null); setModalOpen(true); };

  const tabs = [
    { value: "all",       label: "All",       count: counts.all },
    { value: "lead",      label: "Lead",       count: counts.lead ?? 0 },
    { value: "booked",    label: "Booked",     count: counts.booked ?? 0 },
    { value: "planning",  label: "Planning",   count: counts.planning ?? 0 },
    { value: "this-week", label: "This Week",  count: counts["this-week"] ?? 0 },
    { value: "completed", label: "Completed",  count: counts.completed ?? 0 },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <Tabs tabs={tabs} value={filter} onValueChange={(v) => setFilter(v as Filter)} size="sm" />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="h-9 w-full rounded-md border border-line-strong bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
            />
          </div>
          {filter !== "lead" && (
            <Button size="sm" onClick={openCreate} className="shrink-0">
              <Plus className="size-4" /> New event
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-paper py-16 text-sm text-ink-muted">
          <Loader2 className="size-4 animate-spin" /> Loading…
        </div>
      ) : filteredRows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={query ? "No results" : filter === "lead" ? "No enquiries yet" : "No events yet"}
          description={query ? "Try a different search term." : filter === "lead" ? "New consultation form submissions will appear here." : "Create your first event to get started."}
          action={!query && filter !== "lead" ? <Button size="sm" onClick={openCreate}><Plus className="size-4" /> New event</Button> : undefined}
        />
      ) : (
        <>
          {/* ── Desktop unified table ── */}
          <div className="hidden overflow-hidden rounded-lg border border-line bg-paper md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Contact</th>
                  <th className="px-4 py-2.5 font-medium">Event</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Budget</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Received</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "transition-colors hover:bg-ivory/60",
                      row.kind === "lead" && row.lead?.status === "new" && "bg-gold-tint/40",
                      row.kind === "portal" && "bg-gold-soft/20",
                    )}
                  >
                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={row.name} size="sm" className="shrink-0" />
                        <div className="min-w-0">
                          {row.kind === "event" ? (
                            <Link href={`/internal/events/${row.event!.id}`} className="font-medium text-ink hover:text-gold-dark">
                              {row.name}
                            </Link>
                          ) : (
                            <p className="font-medium text-ink">{row.name}</p>
                          )}
                          {row.email && (
                            <span className="flex items-center gap-1 text-xs text-ink-muted">
                              <Mail className="size-3 shrink-0" />{row.email}
                            </span>
                          )}
                          {row.phone && (
                            <span className="flex items-center gap-1 text-xs text-ink-muted">
                              <Phone className="size-3 shrink-0" />{row.phone}
                            </span>
                          )}
                          {row.kind === "lead" && (row.lead?.assignedTeam ?? []).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(row.lead!.assignedTeam ?? []).map((id) => (
                                <span key={id} className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium text-gold-deep">
                                  {memberName(id).split(" ")[0]}
                                </span>
                              ))}
                            </div>
                          )}
                          {row.kind === "portal" && (row.portal?.assignedTeam ?? []).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(row.portal!.assignedTeam ?? []).map((id) => (
                                <span key={id} className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium text-gold-deep">
                                  {memberName(id).split(" ")[0]}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Event */}
                    <td className="px-4 py-3">
                      <p className="text-ink">{row.eventLabel}</p>
                      {row.eventSub && <p className="text-xs text-ink-muted">{row.eventSub}</p>}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-ink-soft">
                      {row.date ? formatDate(row.date) : <span className="text-ink-muted">TBD</span>}
                    </td>

                    {/* Budget */}
                    <td className="px-4 py-3 font-medium text-ink">{row.budgetLabel}</td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
                        {row.kind === "portal" && (
                          <span title="Portal active" className="inline-flex">
                            <ShieldCheck className="size-3.5 text-success" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Received */}
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-ink-muted">
                        <Clock className="size-3 shrink-0" />{row.timeLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {row.kind === "lead" && (
                          <>
                            <IconBtn label="Assign team" onClick={() => setAssignLeadTarget(row.lead!)}>
                              <UserPlus className="size-4" />
                            </IconBtn>
                            <IconBtn label="Tasks" href="/internal/tasks">
                              <ListChecks className="size-4" />
                            </IconBtn>
                            <IconBtn label="Audit log" href="/internal/audit">
                              <ScrollText className="size-4" />
                            </IconBtn>
                            <IconBtn label="Delete lead" onClick={() => handleDeleteLead(row.lead!)} danger>
                              <Trash2 className="size-4" />
                            </IconBtn>
                          </>
                        )}
                        {row.kind === "lead" && row.lead?.status === "new" && (
                          <Button size="sm" variant="secondary" onClick={() => markContacted(row.lead!)}>
                            Mark contacted
                          </Button>
                        )}
                        {row.kind === "lead" && row.lead?.status === "contacted" && (
                          <Button size="sm" onClick={() => setPromoteTarget(row.lead!)}>
                            Convert to client
                          </Button>
                        )}
                        {row.kind === "lead" && row.lead?.status === "qualified" && (
                          <Button size="sm" onClick={() => setPromoteTarget(row.lead!)}>
                            Convert to client
                          </Button>
                        )}
                        {row.kind === "portal" && (
                          <div className="flex items-center gap-1">
                            <IconBtn label="Edit" onClick={() => setEditingPortal(row.portal!)}>
                              <Pencil className="size-4" />
                            </IconBtn>
                            <IconBtn label="Delete" onClick={() => handleDeletePortal(row.portal!)} danger>
                              <Trash2 className="size-4" />
                            </IconBtn>
                          </div>
                        )}
                        {row.kind === "event" && (
                          <div className="flex items-center gap-1">
                            <IconBtn label="Edit" onClick={() => { setEditing(row.event!); setModalOpen(true); }}>
                              <Pencil className="size-4" />
                            </IconBtn>
                            <IconBtn label="Delete" onClick={() => handleDeleteEvent(row.event!)} danger>
                              <Trash2 className="size-4" />
                            </IconBtn>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
          <div className="space-y-2.5 md:hidden">
            {filteredRows.map((row) => (
              <div
                key={row.id}
                className={cn(
                  "rounded-lg border border-line bg-paper p-4",
                  row.kind === "lead" && row.lead?.status === "new" && "border-gold/30 bg-gold-tint/40",
                  row.kind === "portal" && "border-gold/25 bg-gold-soft/20",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={row.name} size="sm" className="shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{row.name}</p>
                      <p className="truncate text-xs text-ink-muted">{row.eventLabel}{row.eventSub ? ` · ${row.eventSub}` : ""}</p>
                    </div>
                  </div>
                  <Badge variant={row.statusVariant}>{row.statusLabel}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs text-ink-soft">
                  {row.email && <span className="col-span-2 flex items-center gap-1"><Mail className="size-3" />{row.email}</span>}
                  <span>{row.date ? formatDate(row.date) : "TBD"}</span>
                  <span className="text-right font-medium text-ink">{row.budgetLabel}</span>
                  <span className="text-ink-muted">{row.timeLabel}</span>
                </div>
                {row.kind === "lead" && (row.lead?.assignedTeam ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(row.lead!.assignedTeam ?? []).map((id) => (
                      <span key={id} className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium text-gold-deep">
                        {memberName(id).split(" ")[0]}
                      </span>
                    ))}
                  </div>
                )}
                {row.kind === "portal" && (row.portal?.assignedTeam ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(row.portal!.assignedTeam ?? []).map((id) => (
                      <span key={id} className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium text-gold-deep">
                        {memberName(id).split(" ")[0]}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  {row.kind === "lead" && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setAssignLeadTarget(row.lead!)} className="shrink-0">
                        <UserPlus className="size-3.5" /> Assign
                      </Button>
                      <Link href="/internal/tasks" className="inline-flex items-center gap-1 rounded-md border border-line-strong bg-paper px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-gold/40 hover:bg-gold-tint hover:text-gold-dark">
                        <ListChecks className="size-3.5" /> Tasks
                      </Link>
                      <Link href="/internal/audit" className="inline-flex items-center gap-1 rounded-md border border-line-strong bg-paper px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-gold/40 hover:bg-gold-tint hover:text-gold-dark">
                        <ScrollText className="size-3.5" /> Audit
                      </Link>
                    </>
                  )}
                  {row.kind === "lead" && row.lead?.status === "new" && (
                    <Button size="sm" variant="secondary" onClick={() => markContacted(row.lead!)} className="flex-1">Mark contacted</Button>
                  )}
                  {row.kind === "lead" && (row.lead?.status === "contacted" || row.lead?.status === "qualified") && (
                    <Button size="sm" onClick={() => setPromoteTarget(row.lead!)} className="flex-1">Convert to client</Button>
                  )}
                  {row.kind === "lead" && (
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteLead(row.lead!)} className="text-danger shrink-0">
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                  {row.kind === "portal" && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => setEditingPortal(row.portal!)} className="flex-1">
                        <Pencil className="size-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeletePortal(row.portal!)} className="text-danger">
                        <Trash2 className="size-3.5" /> Delete
                      </Button>
                    </>
                  )}
                  {row.kind === "event" && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(row.event!); setModalOpen(true); }} className="flex-1">
                        <Pencil className="size-3.5" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteEvent(row.event!)} className="text-danger">
                        <Trash2 className="size-3.5" /> Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <EventFormModal
          event={editing}
          onClose={() => setModalOpen(false)}
          onSaved={async () => { setModalOpen(false); await load(); }}
        />
      )}
      {editingPortal && (
        <PortalEditModal
          portal={editingPortal}
          onClose={() => setEditingPortal(null)}
          onSaved={async () => { setEditingPortal(null); await load(); }}
        />
      )}
      {promoteTarget && (
        <PromoteLeadModal
          lead={promoteTarget}
          onClose={() => setPromoteTarget(null)}
          onSaved={async () => { setPromoteTarget(null); await load(); }}
        />
      )}
      {assignLeadTarget && (
        <LeadAssignModal
          lead={assignLeadTarget}
          onClose={() => setAssignLeadTarget(null)}
          onSaved={async () => { setAssignLeadTarget(null); await load(); }}
        />
      )}
    </div>
  );
}

// ── PortalEditModal ─────────────────────────────────────────
function PortalEditModal({ portal, onClose, onSaved }: {
  portal: ClientAssignment; onClose: () => void; onSaved: () => void;
}) {
  type PS = "booked" | "planning" | "this-week" | "completed";
  const [form, setForm] = React.useState({
    name: portal.name,
    phone: portal.phone ?? "",
    eventName: portal.eventName,
    eventType: portal.eventType,
    eventDate: portal.eventDate,
    venue: portal.venue,
    location: portal.location,
    guestCount: portal.guestCount ?? "",
    budget: portal.budget ?? "",
    portalStatus: (portal.portalStatus ?? "booked") as PS,
    assignedTeam: portal.assignedTeam ?? [],
  });

  const toggleMemberPortal = (id: string) =>
    setForm((f) => ({
      ...f,
      assignedTeam: f.assignedTeam.includes(id)
        ? f.assignedTeam.filter((m) => m !== id)
        : [...f.assignedTeam, id],
    }));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    setSaving(true); setError("");
    const res = await fetch(`/api/admin/client-assignments/${encodeURIComponent(portal.email)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setSaving(false);
      setError(d.error ?? "Could not save.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-paper shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-serif text-xl text-ink">{portal.name}</h2>
            <p className="text-xs text-ink-muted">{portal.email}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink"><X className="size-5" /></button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          {error && <p role="alert" className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{error}</p>}

          {/* Status — most important, shown first */}
          <Field label="Status" htmlFor="pe-status">
            <Select id="pe-status" value={form.portalStatus} onChange={(e) => set("portalStatus", e.target.value as PS)}>
              <option value="booked">Booked</option>
              <option value="planning">Planning</option>
              <option value="this-week">This Week</option>
              <option value="completed">Completed</option>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Client name" htmlFor="pe-name" required>
              <Input id="pe-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Phone" htmlFor="pe-phone">
              <Input id="pe-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
          </div>

          <div className="rounded-lg border border-line bg-ivory px-4 py-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Event details</p>
            <div className="flex flex-col gap-3">
              <Field label="Event name" htmlFor="pe-ename">
                <Input id="pe-ename" value={form.eventName} onChange={(e) => set("eventName", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Event type" htmlFor="pe-etype">
                  <Input id="pe-etype" value={form.eventType} onChange={(e) => set("eventType", e.target.value)} />
                </Field>
                <Field label="Event date" htmlFor="pe-edate">
                  <Input id="pe-edate" type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Venue" htmlFor="pe-venue">
                  <Input id="pe-venue" value={form.venue} onChange={(e) => set("venue", e.target.value)} />
                </Field>
                <Field label="City" htmlFor="pe-loc">
                  <Input id="pe-loc" value={form.location} onChange={(e) => set("location", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Guests" htmlFor="pe-guests">
                  <Input id="pe-guests" value={form.guestCount} onChange={(e) => set("guestCount", e.target.value)} placeholder="e.g. 150" />
                </Field>
                <Field label="Budget" htmlFor="pe-budget">
                  <Input id="pe-budget" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. 2000000" />
                  {parseBudgetNumber(form.budget ?? "") !== null && (
                    <p className="mt-1 text-xs text-gold-dark">{numberToWords(parseBudgetNumber(form.budget ?? "")!)}</p>
                  )}
                </Field>
              </div>
            </div>
          </div>

          <div>
            <Label>Assign team</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {teamMembers.map((m) => {
                const on = form.assignedTeam.includes(m.id);
                return (
                  <button type="button" key={m.id} onClick={() => toggleMemberPortal(m.id)}
                    className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      on ? "border-gold/40 bg-gold-soft text-gold-deep" : "border-line-strong bg-paper text-ink-soft hover:bg-ivory")}>
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>Save changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── EventFormModal ──────────────────────────────────────────
function EventFormModal({ event, onClose, onSaved }: {
  event: InternalEvent | null; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    client: event?.client ?? "",
    type: event?.type ?? "Wedding",
    date: event?.date ?? "",
    status: event?.status ?? ("lead" as EventStatus),
    budget: event?.budget ?? 0,
    guests: event?.guests ?? 0,
    location: event?.location ?? "",
    assignedTeam: event?.assignedTeam ?? [],
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleMember = (id: string) =>
    setForm((f) => ({
      ...f,
      assignedTeam: f.assignedTeam.includes(id)
        ? f.assignedTeam.filter((m) => m !== id)
        : [...f.assignedTeam, id],
    }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.client.trim()) return setError("Client name is required.");
    if (!form.date) return setError("Please pick an event date.");
    setSaving(true);
    const payload = { ...form, coverSeed: SEED_BY_TYPE[form.type] ?? "udaipur-lake-wedding" };
    const res = await fetch(
      event ? `/api/admin/events/${event.id}` : "/api/admin/events",
      { method: event ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
    );
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setSaving(false);
      setError(d.error ?? "Could not save. Please try again.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-paper shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-xl text-ink">{event ? "Edit event" : "New event"}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink"><X className="size-5" /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          {error && <p role="alert" className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{error}</p>}
          <Field label="Client / event name" htmlFor="ev-client">
            <Input id="ev-client" value={form.client} onChange={(e) => set("client", e.target.value)} placeholder="Aanya & Vikram Mehra" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type" htmlFor="ev-type">
              <Select id="ev-type" value={form.type} onChange={(e) => set("type", e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </Field>
            <Field label="Status" htmlFor="ev-status">
              <Select id="ev-status" value={form.status} onChange={(e) => set("status", e.target.value as EventStatus)}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" htmlFor="ev-date">
              <Input id="ev-date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
            </Field>
            <Field label="Guests" htmlFor="ev-guests">
              <Input id="ev-guests" type="number" min={0} value={form.guests} onChange={(e) => set("guests", Number(e.target.value))} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget (₹)" htmlFor="ev-budget">
              <Input id="ev-budget" type="number" min={0} value={form.budget} onChange={(e) => set("budget", Number(e.target.value))} />
              {form.budget > 0 && (
                <p className="mt-1 text-xs text-gold-dark">{numberToWords(form.budget)}</p>
              )}
            </Field>
            <Field label="Location" htmlFor="ev-loc">
              <Input id="ev-loc" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Taj Lake Palace, Udaipur" />
            </Field>
          </div>
          <div>
            <Label>Assign team</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {teamMembers.map((m) => {
                const on = form.assignedTeam.includes(m.id);
                return (
                  <button type="button" key={m.id} onClick={() => toggleMember(m.id)}
                    className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      on ? "border-gold/40 bg-gold-soft text-gold-deep" : "border-line-strong bg-paper text-ink-soft hover:bg-ivory")}>
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>{event ? "Save changes" : "Create event"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── PromoteLeadModal ────────────────────────────────────────
function PromoteLeadModal({ lead, onClose, onSaved }: {
  lead: Lead; onClose: () => void; onSaved: () => void;
}) {
  const defaultName = `${lead.name.split(" ")[0]}'s ${lead.eventType}`;
  const [form, setForm] = React.useState({
    eventName: defaultName,
    eventType: lead.eventType,
    eventDate: lead.eventDate ?? "",
    venue: "",
    location: "",
    guestCount: lead.guestCount ?? "",
    budget: lead.budget ?? "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.eventDate) return setError("Please enter the event date.");
    if (!form.venue.trim()) return setError("Venue is required.");
    if (!form.location.trim()) return setError("Location is required.");
    setSaving(true);
    const res = await fetch("/api/admin/promote-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, email: lead.email, name: lead.name, phone: lead.phone, ...form }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setSaving(false);
      setError(d.error ?? "Could not promote. Please try again.");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-paper shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-serif text-xl text-ink">Convert to client</h2>
            <p className="mt-0.5 text-sm text-ink-muted">{lead.name} · {lead.email}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink"><X className="size-5" /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          {error && <p role="alert" className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{error}</p>}
          <div className="rounded-lg border border-gold/20 bg-gold-tint px-4 py-3 text-sm text-ink-soft">
            Once saved, <span className="font-medium text-ink">{lead.email}</span> will log in as a <span className="font-medium text-gold-dark">client</span> and see their event progress. Their status will change to <span className="font-medium text-success">Booked</span>.
          </div>
          <Field label="Event name" htmlFor="pm-name">
            <Input id="pm-name" value={form.eventName} onChange={(e) => set("eventName", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Event type" htmlFor="pm-type">
              <Input id="pm-type" value={form.eventType} onChange={(e) => set("eventType", e.target.value)} />
            </Field>
            <Field label="Event date" htmlFor="pm-date">
              <Input id="pm-date" type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
            </Field>
          </div>
          <Field label="Venue" htmlFor="pm-venue">
            <Input id="pm-venue" value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Taj Lake Palace" />
          </Field>
          <Field label="City / location" htmlFor="pm-loc">
            <Input id="pm-loc" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Udaipur, Rajasthan" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Guests" htmlFor="pm-guests">
              <Input id="pm-guests" value={form.guestCount} onChange={(e) => set("guestCount", e.target.value)} placeholder="150" />
            </Field>
            <Field label="Budget" htmlFor="pm-budget">
              <Input id="pm-budget" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. 2500000" />
              {parseBudgetNumber(form.budget ?? "") !== null && (
                <p className="mt-1 text-xs text-gold-dark">{numberToWords(parseBudgetNumber(form.budget ?? "")!)}</p>
              )}
            </Field>
          </div>
          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>Activate client portal</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── LeadAssignModal ─────────────────────────────────────────
function LeadAssignModal({ lead, onClose, onSaved }: {
  lead: Lead; onClose: () => void; onSaved: () => void;
}) {
  const [assigned, setAssigned] = React.useState<string[]>(lead.assignedTeam ?? []);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const toggle = (id: string) =>
    setAssigned((a) => a.includes(id) ? a.filter((m) => m !== id) : [...a, id]);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, assignedTeam: assigned }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl bg-paper shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-serif text-xl text-ink">Assign team</h2>
            <p className="mt-0.5 text-sm text-ink-muted">{lead.name} · {lead.eventType}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink"><X className="size-5" /></button>
        </div>
        <div className="p-6">
          <p className="mb-3 text-sm text-ink-soft">Choose who should handle this enquiry.</p>
          <div className="flex flex-wrap gap-2">
            {teamMembers.map((m) => {
              const on = assigned.includes(m.id);
              return (
                <button type="button" key={m.id} onClick={() => toggle(m.id)}
                  className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    on ? "border-gold/40 bg-gold-soft text-gold-deep" : "border-line-strong bg-paper text-ink-soft hover:bg-ivory")}>
                  {m.name}
                </button>
              );
            })}
          </div>
          <div className="mt-5 flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={save} loading={saving}>Save assignment</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, label, onClick, danger, href }: {
  children: React.ReactNode; label: string; onClick?: () => void; danger?: boolean; href?: string;
}) {
  const cls = cn(
    "inline-flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ivory",
    danger ? "hover:text-danger" : "hover:text-ink",
  );
  if (href) {
    return (
      <Link href={href} aria-label={label} title={label} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button onClick={onClick} aria-label={label} title={label} className={cls}>
      {children}
    </button>
  );
}

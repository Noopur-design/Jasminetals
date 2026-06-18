"use client";

import * as React from "react";
import { X, Ban, ShieldCheck, UserPlus, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MODULES,
  type TeamMember,
  type Module,
  type Perms,
  type MemberStatus,
  type InternalEvent,
} from "@/lib/internal-data";
import type { ClientAssignment } from "@/lib/store";

// A unified assignable work item — covers both real events and portal clients,
// mirroring the unified rows the Events table shows. Portals carry an
// `assignedTeam` too, so a team member can be assigned to either kind.
type AssignableItem = {
  id: string; // evt-… or portal-…
  kind: "event" | "portal";
  client: string;
  sub: string;
  assignedTeam: string[];
};

function eventToItem(e: InternalEvent): AssignableItem {
  return {
    id: e.id,
    kind: "event",
    client: e.client,
    sub: `${e.type} · ${e.location}`,
    assignedTeam: e.assignedTeam ?? [],
  };
}

function portalToItem(p: ClientAssignment): AssignableItem {
  return {
    id: `portal-${p.email}`,
    kind: "portal",
    client: p.name,
    sub: `${p.eventName} · ${p.location}`,
    assignedTeam: p.assignedTeam ?? [],
  };
}

const PERM_KEYS: (keyof Perms)[] = ["view", "create", "edit", "delete", "export"];
const PERM_LABEL: Record<keyof Perms, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  export: "Export",
};

export function AccessMatrix({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  // Local editable copy of the access map.
  const [access, setAccess] = React.useState<Record<Module, Perms>>(() => {
    const map = {} as Record<Module, Perms>;
    for (const entry of member.access) map[entry.module] = { ...entry.perms };
    return map;
  });
  const [status, setStatus] = React.useState<MemberStatus>(member.status);
  const [assigned, setAssigned] = React.useState<string[]>(member.assignedEvents);
  const [items, setItems] = React.useState<AssignableItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load every assignable work item: real events + portal clients, exactly the
  // set the Events table shows. Both endpoints are admin-gated; we merge them
  // into one list so no event/portal is ever missing from this panel.
  React.useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/admin/events", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { events: [] }))
        .catch(() => ({ events: [] })),
      fetch("/api/admin/client-assignments", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { assignments: [] }))
        .catch(() => ({ assignments: [] })),
    ]).then(([evData, ptData]) => {
      if (cancelled) return;
      const events: InternalEvent[] = Array.isArray(evData.events) ? evData.events : [];
      const portals: ClientAssignment[] = Array.isArray(ptData.assignments) ? ptData.assignments : [];
      const merged = [...events.map(eventToItem), ...portals.map(portalToItem)];
      setItems(merged);
      // Reflect live linkage: pre-check any item whose assignedTeam includes
      // this member, in addition to the member's own assignedEvents list.
      const live = merged.filter((it) => it.assignedTeam.includes(member.id)).map((it) => it.id);
      setAssigned((prev) => Array.from(new Set([...prev, ...live])));
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [member.id]);

  const toggle = (mod: Module, key: keyof Perms) =>
    setAccess((prev) => ({ ...prev, [mod]: { ...prev[mod], [key]: !prev[mod][key] } }));

  const toggleEvent = (id: string) =>
    setAssigned((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-ink/50" aria-label="Close panel" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto bg-paper shadow-lift">
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-line bg-paper px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={member.name} size="lg" />
            <div>
              <h2 className="font-serif text-lg text-ink">{member.name}</h2>
              <p className="text-sm text-ink-soft">{member.role}</p>
              <p className="text-xs text-ink-muted">{member.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status === "active" ? "success" : "danger"} className="capitalize">{status}</Badge>
            <button onClick={onClose} className="inline-flex size-8 items-center justify-center rounded-md text-ink-soft hover:bg-ivory" aria-label="Close">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6 px-5 py-5">
          {/* Access matrix */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="size-4 text-gold-dark" />
              <h3 className="text-sm font-semibold text-ink">Permissions</h3>
            </div>
            <div className="overflow-hidden rounded-lg border border-line">
              <table className="w-full text-sm">
                <thead className="border-b border-line bg-ivory text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Module</th>
                    {PERM_KEYS.map((k) => (
                      <th key={k} className="px-2 py-2 text-center font-medium">{PERM_LABEL[k]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {MODULES.map((mod) => (
                    <tr key={mod} className="hover:bg-ivory/50">
                      <td className="px-3 py-2.5 font-medium text-ink">{mod}</td>
                      {PERM_KEYS.map((k) => {
                        const on = access[mod][k];
                        return (
                          <td key={k} className="px-2 py-2.5 text-center">
                            <button
                              role="checkbox"
                              aria-checked={on}
                              aria-label={`${PERM_LABEL[k]} ${mod}`}
                              onClick={() => toggle(mod, k)}
                              className={cn(
                                "inline-flex size-5 items-center justify-center rounded border transition-colors",
                                on
                                  ? "border-gold bg-gold text-on-accent"
                                  : "border-line-strong bg-paper hover:border-gold/50",
                              )}
                            >
                              {on && (
                                <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth={2}>
                                  <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-xs text-ink-muted">Toggles update this session only (design preview).</p>
          </section>

          {/* Assigned events */}
          <section>
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays className="size-4 text-gold-dark" />
              <h3 className="text-sm font-semibold text-ink">Assigned events <span className="text-ink-muted">({assigned.length}/{items.length})</span></h3>
            </div>
            <div className="space-y-1.5">
              {loading && (
                <p className="py-2 text-center text-sm text-ink-muted">Loading events…</p>
              )}
              {!loading && items.length === 0 && (
                <p className="py-2 text-center text-sm text-ink-muted">No events yet.</p>
              )}
              {items.map((it) => {
                const on = assigned.includes(it.id);
                return (
                  <label
                    key={it.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 transition-colors",
                      on ? "border-gold/40 bg-gold-tint" : "border-line bg-paper hover:bg-ivory",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-ink">{it.client}</span>
                        {it.kind === "portal" && (
                          <span className="shrink-0 rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold-dark">Portal</span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">{it.sub}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleEvent(it.id)}
                      className="size-4 shrink-0 accent-[var(--color-gold)]"
                    />
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 mt-auto flex flex-wrap items-center gap-2 border-t border-line bg-paper px-5 py-3">
          {status === "active" ? (
            <Button size="sm" variant="destructive" onClick={() => setStatus("suspended")}>
              <Ban className="size-4" /> Suspend access
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setStatus("active")}>
              <ShieldCheck className="size-4" /> Reinstate
            </Button>
          )}
          <Button size="sm" variant="secondary">
            <UserPlus className="size-4" /> Assign to event
          </Button>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button size="sm" onClick={onClose}>Save changes</Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

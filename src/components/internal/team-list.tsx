"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AccessMatrix } from "@/components/internal/access-matrix";
import { teamMembers, type TeamMember, type InternalEvent } from "@/lib/internal-data";
import type { ClientAssignment } from "@/lib/store";

export function TeamList() {
  const [selected, setSelected] = React.useState<TeamMember | null>(null);
  const [events, setEvents] = React.useState<InternalEvent[]>([]);
  const [portals, setPortals] = React.useState<ClientAssignment[]>([]);

  // Load the same live source the access panel uses, so the per-member Events
  // count below matches the panel's "assigned / total" header (events + portals,
  // never frozen seed data).
  React.useEffect(() => {
    Promise.all([
      fetch("/api/admin/events", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { events: [] }))
        .catch(() => ({ events: [] })),
      fetch("/api/admin/client-assignments", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { assignments: [] }))
        .catch(() => ({ assignments: [] })),
    ]).then(([ev, pt]) => {
      setEvents(Array.isArray(ev.events) ? ev.events : []);
      setPortals(Array.isArray(pt.assignments) ? pt.assignments : []);
    });
  }, []);

  // Count assignable work items (events + portals) a member is on: live linkage
  // via assignedTeam, unioned with the member's own assignedEvents — identical
  // to how AccessMatrix seeds its checked set.
  const countFor = React.useCallback(
    (m: TeamMember) => {
      const ids = new Set<string>(m.assignedEvents);
      for (const e of events) if ((e.assignedTeam ?? []).includes(m.id)) ids.add(e.id);
      for (const p of portals) if ((p.assignedTeam ?? []).includes(m.id)) ids.add(`portal-${p.email}`);
      return ids.size;
    },
    [events, portals],
  );

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-line bg-paper md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Member</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 text-center font-medium">Events</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {teamMembers.map((m) => (
              <tr
                key={m.id}
                onClick={() => setSelected(m)}
                className="cursor-pointer transition-colors hover:bg-ivory/60"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={m.name} size="sm" />
                    <div>
                      <p className="font-medium text-ink">{m.name}</p>
                      <p className="text-xs text-ink-muted">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{m.role}</td>
                <td className="px-4 py-3">
                  <Badge variant={m.status === "active" ? "success" : "danger"} className="capitalize">{m.status}</Badge>
                </td>
                <td className="px-4 py-3 text-center text-ink">{countFor(m)}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gold-dark">
                    Manage access <ChevronRight className="size-3.5" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2.5 md:hidden">
        {teamMembers.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m)}
            className="flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-paper p-4 text-left"
          >
            <div className="flex items-center gap-2.5">
              <Avatar name={m.name} size="sm" />
              <div>
                <p className="font-medium text-ink">{m.name}</p>
                <p className="text-xs text-ink-muted">{m.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={m.status === "active" ? "success" : "danger"} className="capitalize">{m.status}</Badge>
              <ChevronRight className="size-4 text-ink-muted" />
            </div>
          </button>
        ))}
      </div>

      {selected && <AccessMatrix member={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

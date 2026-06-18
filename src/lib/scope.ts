import "server-only";
import type { SessionUser } from "@/lib/auth";
import { memberById, type InternalEvent } from "@/lib/internal-data";
import type { ClientAssignment } from "@/lib/store";

/**
 * Row-level scoping for the internal panel. An ADMIN sees everything; a TEAM
 * member only ever sees the events assigned to them and the tasks belonging to
 * those events. Enforced SERVER-SIDE (in API routes and server components) so it
 * can't be bypassed by calling an endpoint directly.
 */

function assignedEventIds(s: SessionUser): Set<string> {
  // Seed members carry an assignedEvents list; live events also carry an
  // assignedTeam. We honour both so scoping matches the access panel.
  return new Set(memberById(s.uid)?.assignedEvents ?? []);
}

export function scopeEvents(events: InternalEvent[], s: SessionUser): InternalEvent[] {
  if (s.role === "admin") return events;
  const seed = assignedEventIds(s);
  return events.filter((e) => (e.assignedTeam ?? []).includes(s.uid) || seed.has(e.id));
}

export function canSeeEvent(event: InternalEvent, s: SessionUser): boolean {
  if (s.role === "admin") return true;
  return (event.assignedTeam ?? []).includes(s.uid) || assignedEventIds(s).has(event.id);
}

export function scopePortals(portals: ClientAssignment[], s: SessionUser): ClientAssignment[] {
  if (s.role === "admin") return portals;
  return portals.filter((p) => (p.assignedTeam ?? []).includes(s.uid));
}

/** Event ids (stored + portal) a session may see — the basis for task scoping. */
function visibleEventIds(
  events: InternalEvent[],
  portals: ClientAssignment[],
  s: SessionUser,
): Set<string> {
  const ids = new Set(scopeEvents(events, s).map((e) => e.id));
  for (const p of scopePortals(portals, s)) ids.add(`portal-${p.email}`);
  return ids;
}

/**
 * Can this session see (or mutate) a task, given the task's eventId? Admin: always.
 * A team member only for tasks on events/portals assigned to them. Used for both
 * the tasks list filter and the per-task write guards.
 */
export function canSeeTaskEventId(
  eventId: string,
  events: InternalEvent[],
  portals: ClientAssignment[],
  s: SessionUser,
): boolean {
  if (s.role === "admin") return true;
  return visibleEventIds(events, portals, s).has(eventId);
}

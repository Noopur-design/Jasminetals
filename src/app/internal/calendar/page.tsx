import { redirect } from "next/navigation";
import { PageHeader } from "@/components/internal/page-header";
import { Calendar } from "@/components/internal/calendar";
import { QuickLinks } from "@/components/internal/quick-links";
import { listEvents, listClientAssignments } from "@/lib/store";
import { requireStaff } from "@/lib/server-auth";
import { scopeEvents, scopePortals } from "@/lib/scope";
import type { InternalEvent } from "@/lib/internal-data";

export const metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const session = await requireStaff();
  if (!session) redirect("/login");

  const [allEvents, allAssignments] = await Promise.all([
    listEvents(),
    listClientAssignments(),
  ]);
  // Admin sees every event; a team member only their assigned events/portals.
  const storedEvents = scopeEvents(allEvents, session);
  const assignments = scopePortals(allAssignments, session);

  // Convert promoted portal clients into calendar events (gold "booked" dot)
  const portalEvents: InternalEvent[] = assignments.map((a) => ({
    id: `portal-${a.email}`,
    client: a.name,
    type: a.eventType,
    date: a.eventDate,
    status: "booked",
    assignedTeam: [],
    budget: 0,
    location: `${a.venue}, ${a.location}`,
    coverSeed: a.eventName,
    guests: Number(a.guestCount) || 0,
  }));

  // Portal event IDs never collide with stored event IDs (different prefix)
  const merged = [...storedEvents, ...portalEvents];

  return (
    <div className="space-y-4">
      <PageHeader title="Calendar" subtitle="Scheduling & coordination across all events" />
      <QuickLinks />
      <Calendar events={merged} />
    </div>
  );
}

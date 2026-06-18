import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EventDetail } from "@/components/internal/event-detail";
import { QuickLinks } from "@/components/internal/quick-links";
import { runOfShow, budgetBreakdown, vendors, type InternalEvent } from "@/lib/internal-data";
import {
  listEvents,
  listTasksForEvent,
  getClientAssignment,
  clientAssignmentToEvent,
} from "@/lib/store";
import { getServerSession } from "@/lib/server-auth";
import { canSeeEvent } from "@/lib/scope";

// Event ids are minted at runtime (createEvent → evt-<timestamp>) and portal
// clients use portal-<email>, neither known at build time — render on demand.
export const dynamic = "force-dynamic";

// Resolve an event from the LIVE store. Handles both real events and portal
// clients (id `portal-<email>`), so anything that appears in the events list
// has a working detail page.
async function resolveEvent(id: string): Promise<InternalEvent | null> {
  if (id.startsWith("portal-")) {
    const assignment = await getClientAssignment(id.slice("portal-".length));
    return assignment ? clientAssignmentToEvent(assignment) : null;
  }
  const events = await listEvents();
  return events.find((e) => e.id === id) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await resolveEvent(id);
  return { title: event ? event.client : "Event" };
}

// A deterministic vendor sub-set assigned to each event (design-only).
function vendorsForEvent(id: string) {
  if (id === "evt-aanya-vikram")
    return vendors.filter((v) => ["vn-saffron", "vn-tarit", "vn-bloom", "vn-stories", "vn-leela", "vn-glow", "vn-dhol"].includes(v.id));
  // pick the first preferred/confirmed of each as a sensible default
  return vendors.filter((v) => v.status !== "pending").slice(0, 4);
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await resolveEvent(id);
  if (!event) notFound();

  // A team member can only open events assigned to them — don't even reveal that
  // an unassigned event exists.
  const session = await getServerSession();
  if (session && !canSeeEvent(event, session)) notFound();

  const eventTasks = await listTasksForEvent(id);

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Events", href: "/internal/events" },
          { label: event.client },
        ]}
      />
      <QuickLinks />
      <EventDetail
        event={event}
        eventTasks={eventTasks}
        ros={id === "evt-aanya-vikram" ? runOfShow : []}
        budget={budgetBreakdown[id] ?? []}
        assignedVendors={vendorsForEvent(id)}
      />
    </div>
  );
}

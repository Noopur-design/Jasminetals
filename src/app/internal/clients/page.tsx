import { redirect } from "next/navigation";
import { PageHeader } from "@/components/internal/page-header";
import { ClientsTable } from "@/components/internal/clients-table";
import { QuickLinks } from "@/components/internal/quick-links";
import { listClientAssignments } from "@/lib/store";
import type { ClientAssignment } from "@/lib/store";
import { getServerSession } from "@/lib/server-auth";
import { scopePortals } from "@/lib/scope";
import { can } from "@/lib/permissions";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  // Governed by the clients module permission; a team member without it can't
  // see the roster, and one who can is scoped to their own client portals.
  if (!can(session.role, session.permissions, "clients", "view")) redirect("/internal");

  const portalClients = scopePortals(await listClientAssignments(), session);

  const portalCrmRows = portalClients.map((c: ClientAssignment) => ({
    id: `portal-${c.email}`,
    name: c.name,
    email: c.email,
    phone: c.phone ?? "",
    since: c.assignedAt.slice(0, 10),
    eventType: c.eventType,
    eventName: c.eventName,
    eventDate: c.eventDate,
    venue: c.venue,
    location: c.location,
    guestCount: c.guestCount,
    budget: c.budget,
    assignedTeam: c.assignedTeam ?? [],
    isPortal: true as const,
  }));

  return (
    <div className="space-y-4">
      <PageHeader title="Clients" subtitle="CRM — contacts and inquiry pipeline" />
      <QuickLinks />
      <ClientsTable portalRows={portalCrmRows} />
    </div>
  );
}

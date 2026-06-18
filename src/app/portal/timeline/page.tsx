import type { Metadata } from "next";
import { cookies } from "next/headers";
import { TimelineView } from "@/components/portal/timeline-view";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  getClientPortalData,
  setClientPortalData,
  seedClientPortalData,
  getClientAssignment,
  type ClientMilestone,
} from "@/lib/store";
import { milestones as demoMilestones } from "@/lib/portal-data";

export const metadata: Metadata = { title: "Timeline" };

export default async function TimelinePage() {
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );

  let milestones: ClientMilestone[] = demoMilestones;

  if (session?.role === "client" && session.email) {
    let portalData = await getClientPortalData(session.email);
    if (!portalData) {
      // Client was promoted before the portal-data seeder existed — auto-seed now
      const assignment = await getClientAssignment(session.email);
      if (assignment) {
        portalData = seedClientPortalData(assignment);
        await setClientPortalData(portalData);
      }
    }
    if (portalData) milestones = portalData.milestones;
  }

  return <TimelineView milestones={milestones} />;
}

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { MessageThread } from "@/components/portal/message-thread";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  getClientPortalData,
  setClientPortalData,
  seedClientPortalData,
  getClientAssignment,
  type ClientPortalMessage,
} from "@/lib/store";
import { messages as demoMessages } from "@/lib/portal-data";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );

  let messages: ClientPortalMessage[] = session?.role === "client" ? [] : demoMessages;
  const clientName = session?.name ?? "Client";

  if (session?.role === "client" && session.email) {
    let portalData = await getClientPortalData(session.email);
    if (!portalData) {
      const assignment = await getClientAssignment(session.email);
      if (assignment) {
        portalData = seedClientPortalData(assignment);
        await setClientPortalData(portalData);
      }
    }
    if (portalData) messages = portalData.messages;
  }

  return (
    <MessageThread
      initialMessages={messages}
      clientName={clientName}
      plannerName="Jasminetals Team"
    />
  );
}

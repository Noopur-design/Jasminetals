import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/portal-shell";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getClientAssignment, isConsultationBooked } from "@/lib/store";

export const metadata: Metadata = {
  title: {
    default: "Client Portal",
    template: "%s · Client Portal · Jasminetals",
  },
  description: "Track your event with Jasminetals — timeline, budget, mood board and more.",
};

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );
  if (!session) redirect("/login");
  if (session.role !== "client" && session.role !== "admin") {
    redirect(session.role === "team" ? "/internal" : "/");
  }

  const assignment =
    session.role === "client" && session.email
      ? await getClientAssignment(session.email)
      : null;

  // Until the client has actually booked a consultation, don't surface the
  // auto-generated placeholder event details in the sidebar.
  const booked = isConsultationBooked(assignment);

  const clientInfo = {
    name: assignment?.name ?? session.name ?? "Client",
    email: session.email ?? "",
    eventName: booked ? assignment!.eventName : null,
    eventType: booked ? assignment!.eventType : null,
    eventLocation: booked ? assignment!.location : null,
  };

  return <PortalShell clientInfo={clientInfo}>{children}</PortalShell>;
}

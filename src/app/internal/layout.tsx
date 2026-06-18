import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { InternalShell } from "@/components/internal/internal-shell";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Studio OS — Internal",
  robots: { index: false, follow: false },
};

// Hard server-side gate (in addition to middleware): the admin panel never
// renders for anyone who isn't a verified admin. Non-admins are bounced before
// a single byte of admin UI is sent.
export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );
  if (!session) redirect("/admin");
  if (session.role !== "admin" && session.role !== "team") redirect("/portal");

  return (
    <InternalShell
      user={{
        name: session.name || session.email,
        email: session.email,
        role: session.role,
        permissions: session.permissions ?? {},
      }}
    >
      {children}
    </InternalShell>
  );
}

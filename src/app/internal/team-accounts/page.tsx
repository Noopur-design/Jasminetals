import { redirect } from "next/navigation";
import { PageHeader } from "@/components/internal/page-header";
import { QuickLinks } from "@/components/internal/quick-links";
import { TeamAccountsManager } from "@/components/internal/team-accounts-manager";
import { requireAdmin } from "@/lib/server-auth";

export const metadata = { title: "Staff logins" };

export default async function TeamAccountsPage() {
  // Credential management is owner-admin only — team sub-users can never reach it.
  if (!(await requireAdmin())) redirect("/internal");
  return (
    <div className="space-y-4">
      <PageHeader
        title="Staff logins"
        subtitle="Create team usernames, assign or reset passwords, and sign in as a member or client"
      />
      <QuickLinks />
      <TeamAccountsManager />
    </div>
  );
}

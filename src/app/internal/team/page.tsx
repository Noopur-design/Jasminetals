import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/internal/page-header";
import { TeamList } from "@/components/internal/team-list";
import { QuickLinks } from "@/components/internal/quick-links";
import { requireAdmin } from "@/lib/server-auth";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  // Team management is owner-admin only — sub-users can never reach it.
  if (!(await requireAdmin())) redirect("/internal");
  return (
    <div className="space-y-4">
      <PageHeader title="Team" subtitle="Members, roles and per-module access control">
        <Button size="sm">
          <UserPlus className="size-4" /> Invite member
        </Button>
      </PageHeader>
      <QuickLinks exclude="team" />
      <p className="text-sm text-ink-soft">
        Select a member to open their access matrix — toggle View / Create / Edit / Delete / Export per module,
        manage event assignments, and suspend or reinstate access.
      </p>
      <TeamList />
    </div>
  );
}

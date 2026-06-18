import { redirect } from "next/navigation";
import { PageHeader } from "@/components/internal/page-header";
import { SettingsPanels } from "@/components/internal/settings-panels";
import { requireAdmin } from "@/lib/server-auth";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  if (!(await requireAdmin())) redirect("/internal");
  return (
    <div>
      <PageHeader title="Settings" subtitle="Studio profile, branding, billing and notifications" />
      <SettingsPanels />
    </div>
  );
}

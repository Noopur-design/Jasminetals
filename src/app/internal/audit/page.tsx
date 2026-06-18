import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/internal/page-header";
import { AuditViewer } from "@/components/internal/audit-viewer";
import { QuickLinks } from "@/components/internal/quick-links";
import { requireAdmin } from "@/lib/server-auth";

export const metadata = { title: "Audit Log" };

export default async function AuditPage() {
  if (!(await requireAdmin())) redirect("/internal");
  return (
    <div className="space-y-4">
      <PageHeader title="Audit Log" subtitle="Every change, who made it, and when">
        <Button size="sm" variant="secondary">
          <Download className="size-4" /> Export CSV
        </Button>
      </PageHeader>
      <QuickLinks exclude="audit" />
      <AuditViewer />
    </div>
  );
}

import { PageHeader } from "@/components/internal/page-header";
import { Kanban } from "@/components/internal/kanban";
import { QuickLinks } from "@/components/internal/quick-links";

export const metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Tasks" subtitle="Coordination board — drag cards to update stage" />
      <QuickLinks exclude="tasks" />
      <Kanban />
    </div>
  );
}

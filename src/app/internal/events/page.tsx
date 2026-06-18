import { PageHeader } from "@/components/internal/page-header";
import { EventsTable } from "@/components/internal/events-table";
import { QuickLinks } from "@/components/internal/quick-links";

export const metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Events" subtitle="All bookings, leads and live productions" />
      <QuickLinks />
      <EventsTable />
    </div>
  );
}

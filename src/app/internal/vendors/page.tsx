import { PageHeader } from "@/components/internal/page-header";
import { VendorDirectory } from "@/components/internal/vendor-directory";
import { QuickLinks } from "@/components/internal/quick-links";

export const metadata = { title: "Vendors" };

export default function VendorsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Vendors" subtitle="Directory — caterers, decor, photography, venues and more" />
      <QuickLinks />
      <VendorDirectory />
    </div>
  );
}

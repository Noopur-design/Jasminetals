import { redirect } from "next/navigation";
import { PageHeader } from "@/components/internal/page-header";
import { BlogManager } from "@/components/internal/blog-manager";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/server-auth";

export const metadata = { title: "Blog" };

export default async function InternalBlogPage() {
  // Publishing is owner-admin only — team sub-users can never reach it.
  if (!(await requireAdmin())) redirect("/internal");
  return (
    <div className="space-y-4">
      <PageHeader
        title="Blog"
        subtitle="Write, publish and remove posts shown on the public /blog page"
      >
        <Button href="/blog" target="_blank" variant="secondary" size="sm">
          View blog
        </Button>
      </PageHeader>
      <BlogManager />
    </div>
  );
}

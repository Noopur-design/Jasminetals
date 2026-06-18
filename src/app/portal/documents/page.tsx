import type { Metadata } from "next";
import { FileSignature, Receipt, FileText, Download, Inbox, type LucideIcon } from "lucide-react";
import { cookies } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, cn } from "@/lib/utils";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getClientPortalData, seedClientPortalData, setClientPortalData, getClientAssignment } from "@/lib/store";
import type { ClientDocument } from "@/lib/store";

export const metadata: Metadata = { title: "Documents" };

type DocType = "contract" | "invoice" | "other";

const TYPE: Record<DocType, { label: string; icon: LucideIcon; variant: "gold" | "info" | "neutral"; tint: string }> = {
  contract: { label: "Contract", icon: FileSignature, variant: "gold", tint: "bg-gold-soft text-gold-dark" },
  invoice: { label: "Invoice", icon: Receipt, variant: "info", tint: "bg-info-soft text-info" },
  other: { label: "Document", icon: FileText, variant: "neutral", tint: "bg-ivory text-ink-soft" },
};

export default async function DocumentsPage() {
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );

  let documents: ClientDocument[] = [];

  if (session?.role === "client" && session.email) {
    let portalData = await getClientPortalData(session.email);
    if (!portalData) {
      const assignment = await getClientAssignment(session.email);
      if (assignment) {
        portalData = seedClientPortalData(assignment);
        await setClientPortalData(portalData);
      }
    }
    documents = portalData?.documents ?? [];
  }

  const sorted = [...documents].sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="space-y-7">
      <Card>
        <CardContent className="flex flex-col gap-1 p-6">
          <h2 className="font-serif text-xl font-medium text-ink">Documents</h2>
          <p className="text-sm text-ink-soft">
            Contracts, invoices and proposals shared with you. Everything in one place.
          </p>
        </CardContent>
      </Card>

      {sorted.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No documents yet"
          description="Contracts and invoices from Jasminetals will appear here as your planning progresses."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="hidden border-b border-line px-6 py-3 text-xs font-semibold uppercase tracking-wider text-ink-muted sm:grid sm:grid-cols-[1fr_8rem_7rem_6rem]">
              <span>Name</span>
              <span>Type</span>
              <span>Date</span>
              <span className="text-right">Action</span>
            </div>

            <ul className="divide-y divide-line">
              {sorted.map((doc) => {
                const meta = TYPE[doc.type as DocType] ?? TYPE.other;
                const Icon = meta.icon;
                return (
                  <li
                    key={doc.id}
                    className="flex flex-col gap-3 px-6 py-4 sm:grid sm:grid-cols-[1fr_8rem_7rem_6rem] sm:items-center sm:gap-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", meta.tint)}>
                        <Icon className="size-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{doc.name}</p>
                        <p className="text-xs text-ink-muted">{doc.size}</p>
                      </div>
                    </div>

                    <div className="sm:block">
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>

                    <p className="text-sm text-ink-soft">{formatDate(doc.date)}</p>

                    <div className="sm:text-right">
                      <a
                        href={`/api/client/documents/${doc.id}`}
                        download={doc.name}
                        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-gold/40 hover:bg-gold-soft hover:text-gold-deep"
                        aria-label={`Download ${doc.name}`}
                      >
                        <Download className="size-3.5" />
                        Download
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { Search, ArrowRight, Inbox } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { auditLog } from "@/lib/internal-data";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AuditViewer() {
  const [query, setQuery] = React.useState("");
  const [who, setWho] = React.useState("all");

  const people = React.useMemo(() => Array.from(new Set(auditLog.map((a) => a.who))), []);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return auditLog.filter((a) => {
      if (who !== "all" && a.who !== who) return false;
      if (!q) return true;
      return (
        a.who.toLowerCase().includes(q) ||
        a.action.toLowerCase().includes(q) ||
        a.target.toLowerCase().includes(q)
      );
    });
  }, [query, who]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions, targets…"
            className="h-9 w-full rounded-md border border-line-strong bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
          />
        </div>
        <Select value={who} onChange={(e) => setWho(e.target.value)} className="h-9 sm:w-52">
          <option value="all">All people</option>
          {people.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Inbox} title="No matching entries" description="Adjust your search or filter." />
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-hidden rounded-lg border border-line bg-paper md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Who</th>
                  <th className="px-4 py-2.5 font-medium">Action</th>
                  <th className="px-4 py-2.5 font-medium">Target</th>
                  <th className="px-4 py-2.5 font-medium">Change</th>
                  <th className="px-4 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((a) => (
                  <tr key={a.id} className="hover:bg-ivory/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={a.who} size="sm" />
                        <span className="font-medium text-ink">{a.who}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{a.action}</td>
                    <td className="px-4 py-3 text-ink">{a.target}</td>
                    <td className="px-4 py-3">
                      {a.before || a.after ? (
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          {a.before && <span className="rounded bg-danger-soft px-1.5 py-0.5 text-danger">{a.before}</span>}
                          {a.before && a.after && <ArrowRight className="size-3 text-ink-muted" />}
                          {a.after && <span className="rounded bg-success-soft px-1.5 py-0.5 text-success">{a.after}</span>}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-ink-soft">{fmt(a.when)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="space-y-2.5 md:hidden">
            {rows.map((a) => (
              <div key={a.id} className="rounded-lg border border-line bg-paper p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={a.who} size="sm" />
                    <span className="text-sm font-medium text-ink">{a.who}</span>
                  </div>
                  <span className="text-[11px] text-ink-muted">{fmt(a.when)}</span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">{a.action} — <span className="text-ink">{a.target}</span></p>
                {(a.before || a.after) && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs">
                    {a.before && <span className="rounded bg-danger-soft px-1.5 py-0.5 text-danger">{a.before}</span>}
                    {a.before && a.after && <ArrowRight className="size-3 text-ink-muted" />}
                    {a.after && <span className="rounded bg-success-soft px-1.5 py-0.5 text-success">{a.after}</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Wallet, TrendingUp, CircleCheck, Clock, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/portal/progress-bar";
import { BudgetBadge } from "@/components/portal/status";
import { formatINR, cn } from "@/lib/utils";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  getClientPortalData,
  seedClientPortalData,
  getClientAssignment,
  type ClientBudgetLine,
} from "@/lib/store";
import { budget as demoBudget } from "@/lib/portal-data";

export const metadata: Metadata = { title: "Budget" };

export default async function BudgetPage() {
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );

  let budgetData = session?.role === "client" ? null : demoBudget;

  if (session?.role === "client" && session.email) {
    const portalData = await getClientPortalData(session.email);
    if (portalData) {
      budgetData = portalData.budget;
    } else {
      const assignment = await getClientAssignment(session.email);
      if (assignment) budgetData = seedClientPortalData(assignment).budget;
    }
  }

  // No budget set yet
  if (!budgetData || budgetData.total === 0) {
    return (
      <div className="space-y-7">
        <Card>
          <CardContent className="flex flex-col gap-1 p-6">
            <h2 className="font-serif text-xl font-medium text-ink">Budget tracker</h2>
            <p className="text-sm text-ink-soft">
              Your event budget will appear here once confirmed with your planner.
            </p>
          </CardContent>
        </Card>
        <EmptyState
          icon={Inbox}
          title="Budget not confirmed yet"
          description="Your Jasminetals planner will set up your budget breakdown once the planning details are locked. Check back soon."
        />
      </div>
    );
  }

  const lines: ClientBudgetLine[] = budgetData.lines;
  const spent = lines.reduce((s, l) => s + l.spent, 0);
  const remaining = budgetData.total - spent;
  const pct = Math.round((spent / budgetData.total) * 100);

  const paid = lines.filter((l) => l.status === "paid");
  const partial = lines.filter((l) => l.status === "partial");
  const due = lines.filter((l) => l.status === "due");
  const dueAmount = lines.reduce((s, l) => s + (l.allocated - l.spent), 0);

  const summary = [
    {
      label: "Total budget",
      value: formatINR(budgetData.total),
      sub: `${lines.length} categories`,
      icon: Wallet,
      tint: "bg-gold-soft text-gold-dark",
    },
    {
      label: "Spent so far",
      value: formatINR(spent),
      sub: `${pct}% of budget`,
      icon: TrendingUp,
      tint: "bg-info-soft text-info",
    },
    {
      label: "Settled in full",
      value: `${paid.length}`,
      sub: `${partial.length} part-paid · ${due.length} due`,
      icon: CircleCheck,
      tint: "bg-success-soft text-success",
    },
    {
      label: "Outstanding",
      value: formatINR(dueAmount),
      sub: "Across upcoming payments",
      icon: Clock,
      tint: "bg-warning-soft text-warning",
    },
  ];

  return (
    <div className="space-y-7">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-[10px]">Total spend</p>
              <p className="mt-1.5 font-serif text-4xl font-medium text-ink">
                {formatINR(spent)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                of {formatINR(budgetData.total)} allocated
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-3xl font-medium text-gold-dark">{pct}%</p>
              <p className="mt-1 text-sm text-ink-soft">
                {formatINR(remaining)} remaining
              </p>
            </div>
          </div>
          <ProgressBar
            value={spent}
            max={budgetData.total}
            tone="gold"
            className="mt-5"
            label="Total budget used"
          />
        </CardContent>
      </Card>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex flex-col gap-3 p-5">
              <span className={cn("flex size-9 items-center justify-center rounded-full", s.tint)}>
                <s.icon className="size-[18px]" />
              </span>
              <div>
                <p className="font-serif text-2xl font-medium leading-none text-ink">{s.value}</p>
                <p className="mt-1.5 text-sm font-medium text-ink">{s.label}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{s.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-line px-6 py-4">
            <h2 className="font-serif text-lg font-medium text-ink">By category</h2>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 text-right font-semibold">Allocated</th>
                  <th className="px-6 py-3 text-right font-semibold">Spent</th>
                  <th className="w-48 px-6 py-3 font-semibold">Used</th>
                  <th className="px-6 py-3 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l) => {
                  const linePct = l.allocated > 0 ? Math.round((l.spent / l.allocated) * 100) : 0;
                  return (
                    <tr key={l.category} className="border-b border-line last:border-0">
                      <td className="px-6 py-4 font-medium text-ink">{l.category}</td>
                      <td className="px-6 py-4 text-right tabular-nums text-ink-soft">
                        {formatINR(l.allocated)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-ink">
                        {formatINR(l.spent)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            value={l.spent}
                            max={l.allocated}
                            size="sm"
                            tone={l.status === "due" ? "warning" : "gold"}
                          />
                          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink-muted">
                            {linePct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <BudgetBadge status={l.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-ivory/60 font-medium">
                  <td className="px-6 py-4 text-ink">Total</td>
                  <td className="px-6 py-4 text-right tabular-nums text-ink">
                    {formatINR(budgetData.total)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-ink">
                    {formatINR(spent)}
                  </td>
                  <td className="px-6 py-4" colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile stacked */}
          <div className="divide-y divide-line md:hidden">
            {lines.map((l) => {
              const linePct = l.allocated > 0 ? Math.round((l.spent / l.allocated) * 100) : 0;
              return (
                <div key={l.category} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-ink">{l.category}</p>
                    <BudgetBadge status={l.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-ink-soft">
                      {formatINR(l.spent)}{" "}
                      <span className="text-ink-muted">of {formatINR(l.allocated)}</span>
                    </span>
                    <span className="text-xs tabular-nums text-ink-muted">{linePct}%</span>
                  </div>
                  <ProgressBar
                    value={l.spent}
                    max={l.allocated}
                    size="sm"
                    tone={l.status === "due" ? "warning" : "gold"}
                    className="mt-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

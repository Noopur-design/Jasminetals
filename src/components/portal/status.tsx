import {
  CircleCheck,
  Clock,
  CircleDashed,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MilestoneStatus, BudgetLineStatus } from "@/lib/portal-data";

type BadgeVariant = "neutral" | "gold" | "success" | "warning" | "danger" | "info";

const MILESTONE: Record<
  MilestoneStatus,
  { label: string; variant: BadgeVariant; icon: LucideIcon }
> = {
  done: { label: "Done", variant: "success", icon: CircleCheck },
  "in-progress": { label: "In progress", variant: "info", icon: Clock },
  pending: { label: "Pending", variant: "neutral", icon: CircleDashed },
  "action-needed": { label: "Action needed", variant: "warning", icon: TriangleAlert },
};

const BUDGET: Record<BudgetLineStatus, { label: string; variant: BadgeVariant }> = {
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partial", variant: "info" },
  due: { label: "Due", variant: "warning" },
};

export function milestoneMeta(status: MilestoneStatus) {
  return MILESTONE[status];
}

export function MilestoneBadge({ status }: { status: MilestoneStatus }) {
  const meta = MILESTONE[status];
  const Icon = meta.icon;
  return (
    <Badge variant={meta.variant}>
      <Icon className="size-3.5" aria-hidden />
      {meta.label}
    </Badge>
  );
}

export function BudgetBadge({ status }: { status: BudgetLineStatus }) {
  const meta = BUDGET[status];
  return (
    <Badge variant={meta.variant} dot>
      {meta.label}
    </Badge>
  );
}

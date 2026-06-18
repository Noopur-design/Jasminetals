import Link from "next/link";
import { ListChecks, UserCog, ScrollText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  {
    key: "tasks",
    href: "/internal/tasks",
    icon: ListChecks,
    label: "Tasks",
    desc: "Kanban board",
  },
  {
    key: "team",
    href: "/internal/team",
    icon: UserCog,
    label: "Team",
    desc: "Members & access",
  },
  {
    key: "audit",
    href: "/internal/audit",
    icon: ScrollText,
    label: "Audit Log",
    desc: "Change history",
  },
] as const;

type LinkKey = (typeof LINKS)[number]["key"];

export function QuickLinks({
  exclude,
  className,
}: {
  exclude?: LinkKey | LinkKey[];
  className?: string;
}) {
  const excluded = Array.isArray(exclude) ? exclude : exclude ? [exclude] : [];
  const visible = LINKS.filter((l) => !excluded.includes(l.key));
  const cols =
    visible.length === 3
      ? "sm:grid-cols-3"
      : visible.length === 2
        ? "sm:grid-cols-2"
        : "";

  return (
    <div className={cn("grid grid-cols-1 gap-3", cols, className)}>
      {visible.map((l) => (
        <Link
          key={l.key}
          href={l.href}
          className="group flex items-center justify-between rounded-lg border border-line bg-paper px-4 py-3 transition-colors hover:border-gold/40 hover:bg-gold-tint/60"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-ivory text-ink-soft transition-colors group-hover:bg-gold-soft group-hover:text-gold-dark">
              <l.icon className="size-[17px]" />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{l.label}</p>
              <p className="text-xs text-ink-muted">{l.desc}</p>
            </div>
          </div>
          <ArrowRight className="size-3.5 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-gold-dark" />
        </Link>
      ))}
    </div>
  );
}

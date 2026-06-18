"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarClock,
  Wallet,
  Images,
  FileText,
  MessagesSquare,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/utils";

type ClientInfo = {
  name: string;
  email: string;
  eventName: string | null;
  eventType: string | null;
  eventLocation: string | null;
};

const NAV = [
  { href: "/portal", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/portal/timeline", label: "Timeline", icon: CalendarClock },
  { href: "/portal/budget", label: "Budget", icon: Wallet },
  { href: "/portal/moodboard", label: "Mood Board", icon: Images },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/messages", label: "Messages", icon: MessagesSquare },
];

function pageTitle(pathname: string) {
  const match = [...NAV].reverse().find((n) =>
    n.exact ? pathname === n.href : pathname.startsWith(n.href),
  );
  return match?.label ?? "Overview";
}

export function PortalShell({
  children,
  clientInfo,
}: {
  children: React.ReactNode;
  clientInfo: ClientInfo;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div className="min-h-dvh bg-ivory text-ink">
      {/* Fixed sidebar — desktop */}
      <Sidebar pathname={pathname} clientInfo={clientInfo} className="hidden lg:flex" />

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
          />
          <Sidebar
            pathname={pathname}
            clientInfo={clientInfo}
            className="relative flex w-72 max-w-[82vw] shadow-2xl"
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      )}

      <div className="lg:pl-72">
        <Topbar
          title={pageTitle(pathname)}
          clientInfo={clientInfo}
          onMenu={() => setDrawerOpen(true)}
        />
        <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({
  pathname,
  clientInfo,
  className,
  onClose,
}: {
  pathname: string;
  clientInfo: ClientInfo;
  className?: string;
  onClose?: () => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-line bg-paper",
        className,
      )}
    >
      <div className="flex items-center justify-between px-6 py-6">
        <Logo href="/" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-black/[0.04] hover:text-ink lg:hidden"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Event context card */}
      <div className="mx-4 mb-2 rounded-lg border border-line bg-ivory/70 px-4 py-3.5">
        <p className="eyebrow text-[10px]">Your event</p>
        <p className="mt-1 font-serif text-base leading-tight text-ink">
          {clientInfo.eventName ?? "Your event"}
        </p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {[clientInfo.eventType, clientInfo.eventLocation?.split(",")[0]]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <Link
          href="/process"
          onClick={onClose}
          className="mt-2.5 flex items-center gap-0.5 text-xs font-medium text-gold-dark transition-colors hover:text-gold"
        >
          View your journey
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-3" aria-label="Portal sections">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-[var(--ease-elegant)]",
                active
                  ? "bg-gold-soft text-gold-deep"
                  : "text-ink-soft hover:bg-black/[0.04] hover:text-ink",
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  active ? "text-gold-dark" : "text-ink-muted group-hover:text-ink-soft",
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <Avatar name={clientInfo.name} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{clientInfo.name}</p>
            <p className="truncate text-xs text-ink-muted">{clientInfo.email}</p>
          </div>
        </div>
        <LogoutButton className="mt-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-black/[0.04] hover:text-ink">
          <LogOut className="size-[18px] text-ink-muted" />
          Sign out
        </LogoutButton>
      </div>
    </aside>
  );
}

function Topbar({
  title,
  clientInfo,
  onMenu,
}: {
  title: string;
  clientInfo: ClientInfo;
  onMenu: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open menu"
          className="rounded-md p-2 text-ink-soft transition-colors hover:bg-black/[0.04] hover:text-ink lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="eyebrow hidden text-[10px] sm:block">Client portal</p>
          <h1 className="truncate font-serif text-lg font-medium leading-tight text-ink sm:text-xl">
            {title}
          </h1>
        </div>

        <NotificationsBell />
        <AvatarMenu clientInfo={clientInfo} />
      </div>
    </header>
  );
}

function NotificationsBell() {
  const [open, setOpen] = React.useState(false);
  const ref = useDismiss(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative rounded-full p-2 text-ink-soft transition-colors hover:bg-black/[0.04] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <Bell className="size-[19px]" />
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold ring-2 ring-ivory" aria-hidden />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right rounded-lg border border-line bg-paper p-2 shadow-card">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            Notifications
          </p>
          <ul className="space-y-1">
            {[
              { t: "Two tasks need your attention", s: "Guest list & invitation sign-off" },
              { t: "Mood board updated", s: "Warmer florals added by Ishita" },
              { t: "New message from Ishita", s: "Quick to-dos for this week" },
            ].map((n) => (
              <li key={n.t}>
                <div className="rounded-md px-3 py-2.5 transition-colors hover:bg-ivory">
                  <p className="text-sm font-medium text-ink">{n.t}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">{n.s}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AvatarMenu({ clientInfo }: { clientInfo: ClientInfo }) {
  const [open, setOpen] = React.useState(false);
  const ref = useDismiss(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <Avatar name={clientInfo.name} size="md" />
        <ChevronDown className="hidden size-4 text-ink-muted sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-lg border border-line bg-paper p-2 shadow-card">
          <div className="px-3 py-2.5">
            <p className="text-sm font-medium text-ink">{clientInfo.name}</p>
            <p className="truncate text-xs text-ink-muted">{clientInfo.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <LogoutButton className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-ivory hover:text-ink">
            <LogOut className="size-[18px] text-ink-muted" />
            Sign out
          </LogoutButton>
        </div>
      )}
    </div>
  );
}

/** Closes a popover on outside-click or Escape. */
function useDismiss(onClose: () => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return ref;
}

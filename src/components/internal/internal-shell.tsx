"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Store,
  Calendar,
  ListChecks,
  UserCog,
  KeyRound,
  ScrollText,
  BookOpen,
  Settings,
  Search,
  Plus,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";
import { can, type Module, type Permissions } from "@/lib/permissions";

type SessionUserLite = {
  name: string;
  email: string;
  role: "admin" | "team" | "client" | "lead";
  permissions: Permissions;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  module?: Module; // gate visibility on this permission module (team members)
};

const NAV: NavItem[] = [
  { href: "/internal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/internal/events", label: "Events", icon: CalendarDays, module: "events" },
  { href: "/internal/clients", label: "Clients", icon: Users, module: "clients" },
  { href: "/internal/vendors", label: "Vendors", icon: Store, module: "vendors" },
  { href: "/internal/calendar", label: "Calendar", icon: Calendar, module: "calendar" },
  { href: "/internal/tasks", label: "Tasks", icon: ListChecks, module: "tasks" },
  // Owner-admin only — sub-users never see or manage these.
  { href: "/internal/team", label: "Team", icon: UserCog, adminOnly: true },
  { href: "/internal/team-accounts", label: "Staff logins", icon: KeyRound, adminOnly: true },
  { href: "/internal/blog", label: "Blog", icon: BookOpen, adminOnly: true },
  { href: "/internal/audit", label: "Audit Log", icon: ScrollText, adminOnly: true },
  { href: "/internal/settings", label: "Settings", icon: Settings, adminOnly: true },
];

const NOTIFS = [
  { text: "New enquiry from the website contact form", time: "2h ago" },
  { text: "Aanya & Vikram — final payment received", time: "5h ago" },
  { text: "Vendor “Glow by Tina” confirmed for Kapoor Sangeet", time: "1d ago" },
];

function isActive(pathname: string, href: string) {
  if (href === "/internal") return pathname === "/internal";
  return pathname === href || pathname.startsWith(href + "/");
}

export function InternalShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUserLite;
}) {
  const pathname = usePathname() ?? "/internal";
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  // Identity comes from the verified server session, not a cookie hint.
  const isAdmin = user.role === "admin";
  const [impersonating, setImpersonating] = React.useState<string | null>(null);
  const [newOpen, setNewOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [notifSeen, setNotifSeen] = React.useState(false);

  React.useEffect(() => {
    const imp = document.cookie.match(/(?:^|; )jt_impersonating=([^;]+)/);
    setImpersonating(imp ? decodeURIComponent(imp[1]) : null);
  }, []);

  const closeOverlays = () => {
    setDrawerOpen(false);
    setMenuOpen(false);
    setNewOpen(false);
    setNotifOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-ivory text-ink">
      {/* Sidebar — dark ink, gold accents */}
      <Sidebar pathname={pathname} isAdmin={isAdmin} user={user} className="hidden lg:flex" />

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-ink/60"
            onClick={() => setDrawerOpen(false)}
          />
          <Sidebar
            pathname={pathname}
            isAdmin={isAdmin}
            user={user}
            className="relative z-10 flex w-72 shadow-lift"
            onClose={() => setDrawerOpen(false)}
            onNavigate={closeOverlays}
          />
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Impersonation banner — only shown while an admin is "viewing as" someone */}
        {impersonating && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-gold px-4 py-2 text-center text-sm font-medium text-on-accent">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4" /> Viewing as {impersonating}
            </span>
            <a
              href="/exit-impersonation"
              className="rounded-md bg-ink/15 px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-ink/25"
            >
              Return to admin
            </a>
          </div>
        )}

        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-paper/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
          <button
            className="inline-flex size-9 items-center justify-center rounded-md text-ink-soft hover:bg-ivory lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>

          {/* Search */}
          <div className="relative hidden min-w-0 flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              placeholder="Search events, clients, vendors…"
              className="h-9 w-full max-w-md rounded-md border border-line-strong bg-ivory pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:bg-paper focus:outline-none focus:ring-2 focus:ring-gold/25"
            />
          </div>
          <div className="flex-1 sm:hidden" />

          {/* + New */}
          <div className="relative">
            <button
              onClick={() => { setNewOpen((v) => !v); setNotifOpen(false); setMenuOpen(false); }}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-gold px-3 text-sm font-medium text-on-accent shadow-soft transition-colors hover:bg-gold-dark"
              aria-haspopup="menu"
              aria-expanded={newOpen}
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">New</span>
            </button>
            {newOpen && (
              <div role="menu" className="absolute right-0 top-11 z-40 w-52 overflow-hidden rounded-lg border border-line bg-paper py-1 shadow-lift">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Create</p>
                <MenuLink href="/internal/events?new=1" icon={CalendarDays} onClick={closeOverlays}>New event</MenuLink>
                <MenuLink href="/internal/clients?new=1" icon={Users} onClick={closeOverlays}>New client</MenuLink>
                <MenuLink href="/internal/vendors?new=1" icon={Store} onClick={closeOverlays}>New vendor</MenuLink>
                <MenuLink href="/internal/tasks?new=1" icon={ListChecks} onClick={closeOverlays}>New task</MenuLink>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen((v) => !v); setNotifSeen(true); setNewOpen(false); setMenuOpen(false); }}
              className="relative inline-flex size-9 items-center justify-center rounded-md text-ink-soft hover:bg-ivory"
              aria-label="Notifications"
              aria-expanded={notifOpen}
            >
              <Bell className="size-5" />
              {!notifSeen && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-paper" />
              )}
            </button>
            {notifOpen && (
              <div role="menu" className="absolute right-0 top-11 z-40 w-72 overflow-hidden rounded-lg border border-line bg-paper py-1 shadow-lift">
                <p className="border-b border-line px-3 py-2 text-sm font-medium text-ink">Notifications</p>
                {NOTIFS.map((n, i) => (
                  <div key={i} className="flex flex-col gap-0.5 border-b border-line px-3 py-2.5 last:border-0">
                    <p className="text-sm text-ink">{n.text}</p>
                    <span className="text-xs text-ink-muted">{n.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Admin avatar menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-md p-1 pr-2 hover:bg-ivory"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-gold-soft text-xs font-semibold text-gold-deep ring-1 ring-gold/20">
                {initials(user.name)}
              </span>
              <ChevronDown className="hidden size-4 text-ink-muted sm:block" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-lg border border-line bg-paper py-1 shadow-lift"
              >
                <div className="border-b border-line px-3 py-2.5">
                  <p className="text-sm font-medium text-ink">{user.name}</p>
                  <p className="truncate text-xs text-ink-muted">{user.email}</p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-gold-dark">
                    {isAdmin ? "Owner admin" : "Team member"}
                  </p>
                </div>
                {isAdmin && (
                  <MenuLink href="/internal/settings" icon={User} onClick={closeOverlays}>Profile & studio</MenuLink>
                )}
                <MenuLink href="/internal/team-access" icon={ShieldCheck} onClick={closeOverlays}>My workspace</MenuLink>
                <LogoutButton className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-ivory hover:text-ink">
                  <LogOut className="size-4" />
                  Sign out
                </LogoutButton>
              </div>
            )}
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-ivory hover:text-ink"
    >
      <Icon className="size-4" />
      {children}
    </Link>
  );
}

function Sidebar({
  pathname,
  isAdmin,
  user,
  className,
  onClose,
  onNavigate,
}: {
  pathname: string;
  isAdmin: boolean;
  user: SessionUserLite;
  className?: string;
  onClose?: () => void;
  onNavigate?: () => void;
}) {
  // Admin sees the full nav. A team member sees non-admin items, and only the
  // modules they have view permission for.
  const nav = NAV.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.module) return can(user.role, user.permissions, item.module, "view");
    return true;
  });
  return (
    <aside
      className={cn(
        "w-64 shrink-0 flex-col bg-ink text-white/80",
        className,
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <Link href="/internal" className="flex items-center gap-2.5" aria-label="Jasminetals — internal">
          <span className="flex size-8 items-center justify-center rounded-full bg-gold-soft font-serif text-base leading-none text-gold-deep">
            J
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-base text-white">Jasminetals</span>
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-gold">Studio OS</span>
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Internal badge */}
      <div className="px-4 pt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
          <ShieldCheck className="size-3" />
          Internal
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {nav.map((item) => {
          const on = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={on ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                on
                  ? "bg-white/[0.06] font-medium text-white"
                  : "text-white/65 hover:bg-white/[0.04] hover:text-white",
              )}
            >
              {on && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-gold" aria-hidden />}
              <Icon className={cn("size-4 shrink-0", on ? "text-gold" : "text-white/50 group-hover:text-white/80")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Scoped team-view shortcut */}
      <div className="border-t border-white/10 p-3">
        <Link
          href="/internal/team-access"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            isActive(pathname, "/internal/team-access")
              ? "bg-white/[0.06] font-medium text-white"
              : "text-white/55 hover:bg-white/[0.04] hover:text-white",
          )}
        >
          <UserCog className="size-4 text-white/50" />
          Team Access view
        </Link>
        <p className="mt-2 px-3 text-[11px] leading-relaxed text-white/35">
          Staff tool · v2.4 · Delhi NCR
        </p>
      </div>
    </aside>
  );
}

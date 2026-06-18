"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
  { href: "/packages", label: "Packages" },
  { href: "/process", label: "Process" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  // Logged-in state from the (non-httpOnly) jt_role hint cookie. null = logged
  // out → show "Log in"; otherwise show "Dashboard" pointing at the right place.
  const [dashHref, setDashHref] = React.useState<string | null>(null);
  const transparentTop = pathname === "/";

  React.useEffect(() => {
    const m = document.cookie.match(/(?:^|; )jt_role=([^;]+)/);
    const role = m ? decodeURIComponent(m[1]) : null;
    if (role === "client") setDashHref("/portal");
    else if (role === "team" || role === "admin") setDashHref("/internal");
    else setDashHref(null); // logged out or lead (no dashboard yet)
  }, [pathname]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = scrolled || !transparentTop || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-[var(--ease-elegant)]",
        solid
          ? "border-b border-line bg-ivory/85 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-[88rem] items-center justify-between container-px py-4">
        <Logo light={!solid} />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                  solid
                    ? active
                      ? "text-gold-dark"
                      : "text-ink-soft hover:text-ink"
                    : active
                      ? "text-white"
                      : "text-white/80 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={dashHref ?? "/login"}
            className={cn(
              "rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
              solid ? "text-ink-soft hover:text-ink" : "text-white/80 hover:text-white",
            )}
          >
            {dashHref ? "Dashboard" : "Log in"}
          </Link>
          <Button href="/contact" size="sm" variant={solid ? "primary" : "secondary"}>
            Book a Consultation
          </Button>
        </div>

        <button
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-md lg:hidden",
            solid ? "text-ink" : "text-white",
          )}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          "overflow-hidden border-line bg-ivory transition-[max-height] duration-300 ease-[var(--ease-elegant)] lg:hidden",
          open ? "max-h-[80vh] border-b" : "max-h-0",
        )}
      >
        <nav className="flex flex-col gap-1 container-px py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-paper"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
            <Link
              href={dashHref ?? "/login"}
              className="rounded-md px-3 py-3 text-base font-medium text-ink hover:bg-paper"
            >
              {dashHref ? "Dashboard" : "Log in"}
            </Link>
            <Button href="/contact" className="w-full">Book a Consultation</Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/site/logo";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Services",
    links: [
      { label: "Weddings", href: "/services" },
      { label: "Corporate", href: "/services" },
      { label: "Social", href: "/services" },
      { label: "Destination", href: "/services" },
    ],
  },
  {
    title: "Studio",
    links: [
      { label: "About", href: "/about" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Process", href: "/process" },
      { label: "Packages", href: "/packages" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Book a Consultation", href: "/contact" },
      { label: "Client Login", href: "/login" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-[88rem] container-px py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
              A full-service event planning studio crafting weddings, corporate
              gatherings and unforgettable celebrations across Delhi NCR and beyond.
            </p>
            <div className="mt-1 flex flex-col gap-2 text-sm text-ink-soft">
              <a href="mailto:hello@jasminetals.com" className="inline-flex items-center gap-2 hover:text-gold-dark">
                <Mail className="size-4 text-gold" /> hello@jasminetals.com
              </a>
              <a href="tel:+911140000000" className="inline-flex items-center gap-2 hover:text-gold-dark">
                <Phone className="size-4 text-gold" /> +91 11 4000 0000
              </a>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4 text-gold" /> Mehrauli, New Delhi
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-soft transition-colors hover:text-gold-dark"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 sm:flex-row">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} Jasminetals. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="#"
              aria-label="Instagram"
              className="inline-flex size-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold/40 hover:text-gold-dark"
            >
              <InstagramIcon className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="inline-flex size-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold/40 hover:text-gold-dark"
            >
              <FacebookIcon className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

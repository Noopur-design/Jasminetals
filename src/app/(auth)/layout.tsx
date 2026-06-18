import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/site/logo";
import { Photo } from "@/components/ui/photo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Form area */}
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-[55%] lg:px-16">
        <header className="flex justify-center lg:justify-start">
          <Logo />
        </header>

        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">{children}</div>
        </main>

        <footer className="flex flex-col items-center gap-2 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Jasminetals</p>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-gold-dark">
              Privacy
            </Link>
            <span aria-hidden className="text-line-strong">
              ·
            </span>
            <Link href="/terms" className="transition-colors hover:text-gold-dark">
              Terms
            </Link>
          </nav>
        </footer>
      </div>

      {/* Brand panel */}
      <aside className="relative hidden lg:block lg:w-[45%]">
        <Photo
          seed="jasmine-auth-celebration-ballroom-candlelight"
          aspect="fill"
          className="absolute inset-0 h-full w-full"
          rounded="rounded-none"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink/70 via-ink/40 to-ink/25" />
        <div className="relative flex h-full flex-col justify-end p-12 xl:p-16">
          <span className="eyebrow text-gold">Jasminetals</span>
          <blockquote className="mt-5 max-w-md font-serif text-3xl leading-[1.2] text-white xl:text-4xl">
            “Every great celebration begins with a single, considered detail.”
          </blockquote>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/75">
            Curating weddings, galas, and milestone moments across Delhi NCR with
            quiet luxury and meticulous care.
          </p>
        </div>
      </aside>
    </div>
  );
}

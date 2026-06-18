"use client";

import * as React from "react";

/**
 * First-load brand intro: a pair of ornate gates that swing open inward,
 * reveal a "Welcome", then dissolve to the site.
 *
 * The whole sequence is ONE coordinated CSS timeline (see globals.css), so it
 * runs smoothly without JS timing jitter, and it renders from the very first
 * paint (default visible) so there's no flash of the page beforehand.
 * Pure CSS 3D — no heavy libraries, zero server cost. Plays on every full page
 * load; skipped for reduced-motion. Click anywhere to skip.
 */
const DURATION = 4400;

const DAMASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='none' stroke='%23b08d57' stroke-opacity='0.18'%3E%3Cpath d='M30 6c8 8 8 16 0 24-8-8-8-16 0-24zM30 30c8 8 8 16 0 24-8-8-8-16 0-24z'/%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/svg%3E\")";

export function IntroGate() {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    // Reduced-motion users skip the intro (CSS also hides it pre-hydration).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => setVisible(false), DURATION + 60);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      onClick={() => setVisible(false)}
      className="intro-overlay fixed inset-0 z-[200] cursor-pointer select-none"
      style={{ perspective: "2000px" }}
    >
      {/* Backdrop revealed behind the gates */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_30%,#241d12_0%,#15110a_70%,#0d0a06_100%)]" />

      {/* Welcome message */}
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div className="intro-welcome flex flex-col items-center gap-3 px-6">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.5em] text-gold/80">
            Welcome to
          </span>
          <span className="font-serif text-5xl text-[#f4ede1] sm:text-6xl lg:text-7xl">
            Jasminetals
          </span>
          <span className="mt-1 h-px w-16 bg-gold/60" />
          <span className="text-xs tracking-[0.25em] text-[#cbb189] sm:text-sm">
            CELEBRATIONS, CRAFTED WITH CARE
          </span>
        </div>
      </div>

      {/* Gates */}
      <GatePanel side="left" />
      <GatePanel side="right" />

      {/* Centre medallion — fades as the gates part */}
      <div className="intro-medallion absolute left-1/2 top-1/2 flex size-28 items-center justify-center rounded-full border border-gold/50 bg-[#fbfaf8] shadow-[0_0_40px_rgba(176,141,87,0.35)]">
        <span className="font-serif text-5xl italic text-gold-deep">J</span>
      </div>

      <span className="intro-hint absolute bottom-7 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.2em] text-white/50">
        CLICK TO SKIP
      </span>
    </div>
  );
}

function GatePanel({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className={`intro-door ${isLeft ? "intro-door-left" : "intro-door-right"} absolute top-0 h-full w-1/2`}
      style={{
        left: isLeft ? 0 : "50%",
        transformOrigin: isLeft ? "left center" : "right center",
        backgroundColor: "#f7f2e9",
        backgroundImage: `linear-gradient(${isLeft ? 90 : 270}deg, rgba(125,96,56,0.18), rgba(125,96,56,0) 22%), ${DAMASK}`,
        boxShadow: isLeft
          ? "inset -2px 0 0 rgba(176,141,87,0.7), inset -12px 0 34px rgba(125,96,56,0.12)"
          : "inset 2px 0 0 rgba(176,141,87,0.7), inset 12px 0 34px rgba(125,96,56,0.12)",
      }}
    >
      {/* Inset gold frames */}
      <div className="absolute inset-5 rounded-sm border border-gold/40" />
      <div className="absolute inset-7 rounded-sm border border-gold/20" />
      {/* Vertical ornament near the seam */}
      <div
        className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-3"
        style={{ [isLeft ? "right" : "left"]: "1.75rem" } as React.CSSProperties}
      >
        <span className="size-2 rotate-45 bg-gold/50" />
        <span className="h-28 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
        <span className="size-2 rotate-45 bg-gold/50" />
      </div>
    </div>
  );
}

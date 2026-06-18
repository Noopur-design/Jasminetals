"use client";

import * as React from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Slim fixed banner that appears when the browser goes offline and slides
 * away once the connection returns. Listens to the `window` online/offline
 * events. Announced politely to assistive tech via `role="status"`.
 */
export function ConnectionWatch() {
  const [offline, setOffline] = React.useState(false);

  React.useEffect(() => {
    // Sync with the current state on mount (navigator may already be offline).
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("offline", sync);
    window.addEventListener("online", sync);
    return () => {
      window.removeEventListener("offline", sync);
      window.removeEventListener("online", sync);
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!offline}
      className={cn(
        "fixed inset-x-0 top-0 z-200 flex items-center justify-center gap-2.5 bg-ink px-4 py-2 text-center text-sm font-medium text-white shadow-card",
        "transition-transform duration-300 ease-[var(--ease-elegant)]",
        offline ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <WifiOff className="size-4 text-gold" aria-hidden />
      <span>
        You&apos;re offline — reconnecting<span aria-hidden>…</span>
      </span>
    </div>
  );
}

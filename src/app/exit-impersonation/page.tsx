"use client";

import * as React from "react";
import { Loader2, ShieldCheck } from "lucide-react";

// Standalone return-to-admin page. Reachable from anywhere (including the client
// portal) because it is not behind the proxy's role gate. It calls the
// impersonation DELETE endpoint, which restores the stashed admin session, then
// bounces back to the internal panel.
export default function ExitImpersonationPage() {
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/impersonate", { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.redirectTo) {
          window.location.href = data.redirectTo;
        } else {
          window.location.href = data.redirectTo ?? "/";
        }
      } catch {
        if (!cancelled) setError("Could not return to admin. Try logging in again at /admin.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-xl border border-white/10 bg-paper p-8 text-center shadow-lift">
        <div className="flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
          <ShieldCheck className="size-6" />
        </div>
        {error ? (
          <>
            <h1 className="font-serif text-xl text-ink">Couldn’t return</h1>
            <p className="text-sm text-ink-soft">{error}</p>
            <a href="/admin" className="mt-1 text-sm text-gold-dark underline underline-offset-2">
              Go to admin login
            </a>
          </>
        ) : (
          <>
            <h1 className="font-serif text-xl text-ink">Returning to admin…</h1>
            <p className="inline-flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="size-4 animate-spin" /> Restoring your admin session
            </p>
          </>
        )}
      </div>
    </div>
  );
}

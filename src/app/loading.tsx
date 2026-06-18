import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-ivory px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full border border-gold/30 bg-gold-soft text-gold-dark">
        <Loader2 className="size-6 animate-spin" aria-hidden />
      </span>
      <p className="font-serif text-xl text-ink">Setting the scene…</p>
      <p className="text-sm text-ink-soft">Just a moment while we bring this together.</p>
      <span className="sr-only" role="status">
        Loading
      </span>
    </div>
  );
}

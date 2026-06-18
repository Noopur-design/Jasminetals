import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Photo } from "@/components/ui/photo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ivory px-6 py-16">
      <Photo
        seed="udaipur-couple-portrait"
        aspect="fill"
        rounded="rounded-none"
        priority
        className="absolute inset-0 h-full w-full"
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative flex max-w-xl flex-col items-center gap-6 text-center text-white">
        <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium tracking-wide backdrop-blur-sm">
          404 · Page not found
        </span>
        <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">
          This page seems to have slipped away
        </h1>
        <p className="max-w-md text-lg text-white/85">
          The link may be broken or the page may have moved. Let&apos;s get you back to
          something beautiful.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button href="/" size="lg">
            Back home <ArrowRight className="size-4" />
          </Button>
          <Button href="/portfolio" size="lg" variant="secondary">
            View portfolio
          </Button>
        </div>
      </div>
    </main>
  );
}

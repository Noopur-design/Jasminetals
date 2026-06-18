"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthForm } from "@/components/auth/auth-form";
import { Photo } from "@/components/ui/photo";

/** The login/sign-up popup, mounted once globally and toggled via useAuth. */
export function AuthModal() {
  const { modalOpen, mode, setMode, closeAuth } = useAuth();

  React.useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAuth();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modalOpen, closeAuth]);

  if (!modalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={closeAuth}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
    >
      <div
        className="relative grid w-full max-w-3xl overflow-hidden rounded-xl bg-paper shadow-lift sm:grid-cols-[1fr_0.85fr]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeAuth}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-black/[0.05] hover:text-ink"
        >
          <X className="size-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto p-7 sm:p-9">
          <AuthForm mode={mode} onSwitchMode={setMode} onClose={closeAuth} />
        </div>

        {/* Brand panel (desktop only) */}
        <div className="relative hidden sm:block">
          <Photo
            seed="jasmine-auth-celebration-ballroom-candlelight"
            aspect="fill"
            rounded="rounded-none"
            className="absolute inset-0 h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-white">
            <p className="font-serif text-2xl leading-snug">
              “Every great celebration begins with a single, considered detail.”
            </p>
            <p className="mt-2 text-sm text-white/70">Jasminetals — Delhi NCR</p>
          </div>
        </div>
      </div>
    </div>
  );
}

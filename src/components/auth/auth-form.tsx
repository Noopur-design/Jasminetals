"use client";

import * as React from "react";
import { Mail, Lock, User, Phone, Eye, EyeOff, TriangleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useAuth } from "@/components/auth/auth-provider";

type Mode = "login" | "signup";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

const FRIENDLY: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
  "auth/weak-password": "Use a stronger password (at least 6 characters).",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups and retry.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled yet in Firebase.",
  "auth/network-request-failed": "Network error. Check your connection and retry.",
  "auth/unauthorized-domain": "This domain isn't authorized in Firebase Auth settings.",
};

function messageFor(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  return FRIENDLY[code] ?? "Something went wrong. Please try again.";
}

export function AuthForm({
  mode,
  onSwitchMode,
  onClose,
}: {
  mode: Mode;
  onSwitchMode: (m: Mode) => void;
  onClose?: () => void;
}) {
  const { signInEmail, signUpEmail, signInGoogle, resetPassword } = useAuth();
  const [form, setForm] = React.useState({ name: "", phone: "", email: "", password: "" });
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [resetSent, setResetSent] = React.useState(false);
  // Set to the email we just sent a verification link to (signup needs it before login).
  const [verifyEmail, setVerifyEmail] = React.useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResetSent(false);
    if (mode === "signup") {
      if (!form.name.trim()) return setError("Please enter your name.");
      if (form.password.length < 6)
        return setError("Use at least 6 characters for your password.");
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpEmail(form);
        // Signup no longer auto-enters — show a verify-your-email confirmation.
        setVerifyEmail(form.email.trim());
        setLoading(false);
      } else {
        await signInEmail(form.email, form.password);
        // success → provider redirects
      }
    } catch (err) {
      setError(messageFor(err));
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInGoogle();
    } catch (err) {
      setError(messageFor(err));
      setGoogleLoading(false);
    }
  }

  async function handleReset() {
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter your email above first, then tap reset.");
      return;
    }
    try {
      await resetPassword(form.email);
      setResetSent(true);
    } catch (err) {
      setError(messageFor(err));
    }
  }

  const isSignup = mode === "signup";

  // After an email/password signup we no longer drop the user straight in — show
  // a "verify your email" confirmation so a fresh account can't silently claim a
  // pre-assigned client portal.
  if (verifyEmail) {
    return (
      <div>
        <span className="eyebrow text-gold-dark">Almost there</span>
        <h2 className="mt-2 font-serif text-3xl text-ink">Verify your email</h2>
        <div className="mt-6 flex items-start gap-2 rounded-md border border-success/25 bg-success-soft px-3.5 py-3 text-sm text-success">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          <span>
            Your account was created. We sent a verification link to{" "}
            <strong className="font-semibold">{verifyEmail}</strong>. Click it to confirm your
            address, then sign in. (Check your spam folder too.)
          </span>
        </div>
        <Button
          type="button"
          size="lg"
          className="mt-6 w-full"
          onClick={() => {
            setVerifyEmail(null);
            setForm((f) => ({ ...f, password: "" }));
            onSwitchMode("login");
          }}
        >
          Back to sign in
        </Button>
        <p className="mt-3 text-center text-xs text-ink-muted">
          Prefer instant access? Use “Continue with Google”.
        </p>
      </div>
    );
  }

  return (
    <div>
      <span className="eyebrow text-gold-dark">Client &amp; Team</span>
      <h2 className="mt-2 font-serif text-3xl text-ink">
        {isSignup ? "Create your account" : "Welcome back"}
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        {isSignup
          ? "Tell us a little about you to get started."
          : "Sign in to manage your events, proposals and timelines."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-md border border-line-strong bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ivory disabled:opacity-60"
      >
        <GoogleIcon className="size-5" />
        {googleLoading ? "Connecting…" : `Continue with Google`}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
      </div>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          <TriangleAlert className="size-4 shrink-0" />
          {error}
        </div>
      )}
      {resetSent && (
        <div role="status" className="mb-4 flex items-start gap-2 rounded-md border border-success/25 bg-success-soft px-3.5 py-2.5 text-sm text-success">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          <span>
            If an account exists for that email, a reset link is on its way — check your
            inbox and spam. If you’ve never created an account, sign up first.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {isSignup && (
          <>
            <Field label="Full name" htmlFor="af-name">
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
                <Input id="af-name" autoComplete="name" placeholder="Aanya Sharma" className="pl-10" value={form.name} onChange={set("name")} />
              </div>
            </Field>
            <Field label="Phone number" htmlFor="af-phone">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
                <Input id="af-phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" className="pl-10" value={form.phone} onChange={set("phone")} />
              </div>
            </Field>
          </>
        )}

        <Field label="Email address" htmlFor="af-email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <Input id="af-email" type="email" autoComplete="email" placeholder="you@example.com" className="pl-10" value={form.email} onChange={set("email")} />
          </div>
        </Field>

        <Field label="Password" htmlFor="af-password" hint={isSignup ? "At least 6 characters." : undefined}>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
            <Input
              id="af-password"
              type={showPw ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              placeholder={isSignup ? "Create a password" : "••••••••"}
              className="px-10"
              value={form.password}
              onChange={set("password")}
            />
            <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-muted hover:text-ink">
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        {!isSignup && (
          <button type="button" onClick={handleReset} className="-mt-1 self-end text-sm font-medium text-gold-dark underline-offset-4 hover:underline">
            Forgot password?
          </button>
        )}

        <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
          {isSignup ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {isSignup ? "Already have an account? " : "New to Jasminetals? "}
        <button
          type="button"
          onClick={() => onSwitchMode(isSignup ? "login" : "signup")}
          className="font-medium text-gold-dark underline-offset-4 hover:underline"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </button>
      </p>

      {onClose && (
        <p className="mt-2 text-center text-xs text-ink-muted">
          <button type="button" onClick={onClose} className="underline-offset-4 hover:underline">
            Continue browsing
          </button>
        </p>
      )}
    </div>
  );
}

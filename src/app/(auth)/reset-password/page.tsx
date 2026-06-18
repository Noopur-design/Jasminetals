"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: "Too weak", color: "bg-danger" },
  { label: "Weak", color: "bg-warning" },
  { label: "Fair", color: "bg-warning" },
  { label: "Good", color: "bg-success" },
  { label: "Strong", color: "bg-success" },
];

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [errors, setErrors] = React.useState<{ password?: string; confirm?: string }>({});

  const score = scorePassword(password);

  function validate() {
    const next: typeof errors = {};
    if (!password) next.password = "Choose a new password.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords don’t match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1400);
  }

  if (done) {
    return (
      <div className="rise-in text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CircleCheck className="size-7" aria-hidden />
        </div>
        <h1 className="text-3xl">Password reset</h1>
        <p className="mt-3 text-ink-soft">
          Your password has been updated. You can now sign in with your new
          credentials.
        </p>
        <Button href="/login" size="lg" className="mt-7 w-full">
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="rise-in">
      <span className="eyebrow text-gold-dark">Set a new password</span>
      <h1 className="mt-3 text-3xl sm:text-4xl">Reset your password</h1>
      <p className="mt-3 text-ink-soft">
        Choose a strong password you haven’t used before.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
        <Field label="New password" htmlFor="password" error={errors.password}>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a new password"
              className="px-10"
              value={password}
              aria-invalid={!!errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-1" aria-live="polite">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      i < score ? STRENGTH[score].color : "bg-line-strong",
                    )}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-ink-muted">
                Strength: <span className="font-medium text-ink-soft">{STRENGTH[score].label}</span>
                {" — "}mix upper &amp; lowercase, numbers, and symbols.
              </p>
            </div>
          )}
        </Field>

        <Field label="Confirm new password" htmlFor="confirm" error={errors.confirm}>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <Input
              id="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              className="pl-10"
              value={confirm}
              aria-invalid={!!errors.confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </Field>

        <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-gold-dark underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

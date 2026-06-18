"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string>();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1400);
  }

  if (sent) {
    return (
      <div className="rise-in">
        <EmptyState
          icon={MailCheck}
          title="Check your inbox"
          description={`If an account exists for ${email}, we’ve sent a link to reset your password. The link expires in 30 minutes.`}
          action={
            <Button href="/reset-password" variant="outline">
              I have the reset link
            </Button>
          }
        />
        <p className="mt-6 text-center text-sm text-ink-soft">
          Didn’t receive it?{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="font-medium text-gold-dark underline-offset-4 hover:underline"
          >
            Try another email
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="rise-in">
      <span className="eyebrow text-gold-dark">Password recovery</span>
      <h1 className="mt-3 text-3xl sm:text-4xl">Forgot your password?</h1>
      <p className="mt-3 text-ink-soft">
        Enter the email tied to your account and we’ll send you a secure link to
        reset it.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
        <Field label="Email address" htmlFor="email" error={error}>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              aria-hidden
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-10"
              value={email}
              aria-invalid={!!error}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </Field>

        <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
          {loading ? "Sending link…" : "Send reset link"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-gold-dark underline-offset-4 hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to sign in
      </Link>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { MailCheck, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";

const RESEND_SECONDS = 30;

export default function VerifyEmailPage() {
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [seconds, setSeconds] = React.useState(RESEND_SECONDS);

  React.useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) {
      setError("Enter all six digits.");
      return;
    }
    setError(undefined);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
    }, 1400);
  }

  function handleResend() {
    if (seconds > 0) return;
    setSeconds(RESEND_SECONDS);
    setCode("");
    setError(undefined);
  }

  if (verified) {
    return (
      <div className="rise-in text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CircleCheck className="size-7" aria-hidden />
        </div>
        <h1 className="text-3xl">Email verified</h1>
        <p className="mt-3 text-ink-soft">
          Your email address is confirmed. Welcome to Jasminetals.
        </p>
        <Button href="/login" size="lg" className="mt-7 w-full">
          Continue to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="rise-in text-center">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
        <MailCheck className="size-7" aria-hidden />
      </div>
      <h1 className="text-3xl sm:text-4xl">Verify your email</h1>
      <p className="mt-3 text-ink-soft">
        We sent a 6-digit code to your inbox. Enter it below to confirm your
        address.
      </p>

      <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-5">
        <div className="text-left">
          <OtpInput value={code} onChange={setCode} invalid={!!error} ariaLabel="Email verification code" />
          {error && (
            <p className="mt-2 text-center text-xs text-danger" role="alert">
              {error}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Didn’t get a code?{" "}
        {seconds > 0 ? (
          <span className="text-ink-muted">Resend in {seconds}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="font-medium text-gold-dark underline-offset-4 hover:underline"
          >
            Resend code
          </button>
        )}
      </p>

      <Link
        href="/login"
        className="mt-2 inline-block text-sm font-medium text-gold-dark underline-offset-4 hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  );
}

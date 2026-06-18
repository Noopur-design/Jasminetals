"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/auth/otp-input";

export default function MfaPage() {
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [verified, setVerified] = React.useState(false);
  const [error, setError] = React.useState<string>();

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) {
      setError("Enter the full 6-digit code from your app.");
      return;
    }
    setError(undefined);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
    }, 1400);
  }

  if (verified) {
    return (
      <div className="rise-in text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CircleCheck className="size-7" aria-hidden />
        </div>
        <h1 className="text-3xl">Identity confirmed</h1>
        <p className="mt-3 text-ink-soft">
          Two-factor verification complete. Taking you to your dashboard…
        </p>
        <Button href="/login" size="lg" className="mt-7 w-full">
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="rise-in text-center">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
        <ShieldCheck className="size-7" aria-hidden />
      </div>
      <span className="eyebrow text-gold-dark">Two-factor authentication</span>
      <h1 className="mt-3 text-3xl sm:text-4xl">Verify it’s you</h1>
      <p className="mt-3 text-ink-soft">
        Enter the 6-digit code from your authenticator app to continue.
      </p>

      <form onSubmit={handleVerify} className="mt-8 flex flex-col gap-5">
        <div className="text-left">
          <OtpInput value={code} onChange={setCode} invalid={!!error} ariaLabel="Authenticator code" />
          {error && (
            <p className="mt-2 text-center text-xs text-danger" role="alert">
              {error}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Verifying…" : "Verify code"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Lost your device?{" "}
        <Link
          href="/login"
          className="font-medium text-gold-dark underline-offset-4 hover:underline"
        >
          Use a recovery code instead
        </Link>
      </p>
    </div>
  );
}

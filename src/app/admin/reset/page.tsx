"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, TriangleAlert, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Logo } from "@/components/site/logo";

export default function AdminResetPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-paper p-8 text-center shadow-lift">
          <TriangleAlert className="mx-auto mb-3 size-8 text-danger" />
          <p className="text-sm text-ink-soft">Invalid reset link. Go back to <a href="/admin" className="text-gold-dark hover:underline">admin login</a>.</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password || password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        setError(data.error ?? "Reset failed.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/admin"), 2500);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-paper p-8 shadow-lift">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div className="mt-2 flex size-12 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="font-serif text-2xl text-ink">Set new password</h1>
          <p className="text-sm text-ink-soft">Choose a strong password for the admin panel.</p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CircleCheck className="size-10 text-success" />
            <p className="font-medium text-ink">Password updated!</p>
            <p className="text-sm text-ink-soft">Redirecting to login…</p>
          </div>
        ) : (
          <>
            {error && (
              <div role="alert" className="mb-4 flex items-center gap-2 rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                <TriangleAlert className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <Field label="New password" htmlFor="new-password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="new-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    className="px-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-muted hover:text-ink"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Confirm password" htmlFor="confirm-password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
                  <Input
                    id="confirm-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    className="pl-10"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
              </Field>

              <Button type="submit" size="lg" loading={loading} className="w-full">
                Update password
              </Button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-xs text-ink-muted">
          <a href="/admin" className="hover:text-ink-soft">← Back to login</a>
        </p>
      </div>
    </div>
  );
}

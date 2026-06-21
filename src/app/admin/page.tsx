"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck, TriangleAlert, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Logo } from "@/components/site/logo";
import { cn } from "@/lib/utils";

type Mode = "admin" | "team" | "client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("admin");

  // Admin (owner) fields
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);

  // Team fields
  const [username, setUsername] = React.useState("");
  const [teamPassword, setTeamPassword] = React.useState("");
  const [showTeam, setShowTeam] = React.useState(false);

  // Client fields
  const [clientEmail, setClientEmail] = React.useState("");
  const [clientPassword, setClientPassword] = React.useState("");
  const [showClient, setShowClient] = React.useState(false);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!password) return setError("Enter the admin password.");
    setLoading(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push(data.redirectTo ?? "/internal");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  async function handleTeamSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username || !teamPassword) return setError("Enter your username and password.");
    setLoading(true);
    try {
      const res = await fetch("/api/team-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: teamPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push(data.redirectTo ?? "/internal");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  async function handleClientSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!clientEmail || !clientPassword) return setError("Enter your email and password.");
    setLoading(true);
    try {
      const res = await fetch("/api/client-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clientEmail, password: clientPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        setError(data.error ?? "Login failed.");
        return;
      }
      router.push(data.redirectTo ?? "/portal");
      router.refresh();
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
          <h1 className="font-serif text-2xl text-ink">Studio sign in</h1>
          <p className="text-sm text-ink-soft">
            {mode === "admin"
              ? "Owner access — enter the admin password."
              : mode === "team"
                ? "Team access — sign in with your username and password."
                : "Client access — sign in to your event portal."}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-5 grid grid-cols-3 gap-1 rounded-lg border border-line bg-ivory p-1">
          <button
            type="button"
            onClick={() => switchMode("admin")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
              mode === "admin" ? "bg-paper text-ink shadow-soft" : "text-ink-muted hover:text-ink",
            )}
          >
            <ShieldCheck className="size-4" /> Admin
          </button>
          <button
            type="button"
            onClick={() => switchMode("team")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
              mode === "team" ? "bg-paper text-ink shadow-soft" : "text-ink-muted hover:text-ink",
            )}
          >
            <User className="size-4" /> Team
          </button>
          <button
            type="button"
            onClick={() => switchMode("client")}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
              mode === "client" ? "bg-paper text-ink shadow-soft" : "text-ink-muted hover:text-ink",
            )}
          >
            <Heart className="size-4" /> Client
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex items-center gap-2 rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
          >
            <TriangleAlert className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {mode === "admin" ? (
          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4" noValidate>
            <Field label="Admin password" htmlFor="admin-password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
                <Input
                  id="admin-password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="px-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-muted hover:text-ink"
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Enter dashboard
            </Button>
          </form>
        ) : mode === "team" ? (
          <form onSubmit={handleTeamSubmit} className="flex flex-col gap-4" noValidate>
            <Field label="Username" htmlFor="team-username">
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
                <Input
                  id="team-username"
                  type="text"
                  autoComplete="username"
                  placeholder="your-username"
                  className="px-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </div>
            </Field>
            <Field label="Password" htmlFor="team-password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
                <Input
                  id="team-password"
                  type={showTeam ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="px-10"
                  value={teamPassword}
                  onChange={(e) => setTeamPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowTeam((s) => !s)}
                  aria-label={showTeam ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-muted hover:text-ink"
                >
                  {showTeam ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign in
            </Button>
            <p className="text-center text-xs text-ink-muted">
              Forgot your password? Only your studio admin can reset it.
            </p>
          </form>
        ) : (
          <form onSubmit={handleClientSubmit} className="flex flex-col gap-4" noValidate>
            <Field label="Email" htmlFor="client-email">
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
                <Input
                  id="client-email"
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  className="px-10"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </Field>
            <Field label="Password" htmlFor="client-password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" aria-hidden />
                <Input
                  id="client-password"
                  type={showClient ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="px-10"
                  value={clientPassword}
                  onChange={(e) => setClientPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowClient((s) => !s)}
                  aria-label={showClient ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-muted hover:text-ink"
                >
                  {showClient ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign in to portal
            </Button>
            <p className="text-center text-xs text-ink-muted">
              Prefer Google? Use <a href="/login" className="underline underline-offset-2 hover:text-gold-dark">/login</a>.
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-ink-muted">
          Client portal access is at{" "}
          <a href="/login" className="underline underline-offset-2 hover:text-gold-dark">/login</a>
        </p>
      </div>
    </div>
  );
}

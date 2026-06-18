"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  LogIn,
  ShieldCheck,
  Ban,
  X,
  Loader2,
  KeyRound,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Permissions } from "@/lib/permissions";

// ── Permission presets (mirrors the server's Permissions model) ──
const PERM_MODULES = ["events", "clients", "vendors", "tasks", "calendar"] as const;
const PERM_ACTIONS = ["view", "create", "edit", "delete"] as const;
type Preset = "viewer" | "editor" | "full";

function buildPreset(p: Preset): Permissions {
  const map: Permissions = {};
  for (const m of PERM_MODULES) {
    if (p === "full") map[m] = { view: true, create: true, edit: true, delete: true };
    else if (p === "editor") map[m] = { view: true, create: true, edit: true, delete: false };
    else map[m] = { view: true, create: false, edit: false, delete: false };
  }
  return map;
}

function detectPreset(perms: Permissions | undefined): Preset {
  const has = (m: string, a: string) =>
    Boolean((perms as Record<string, Record<string, boolean>> | undefined)?.[m]?.[a]);
  if (PERM_MODULES.every((m) => PERM_ACTIONS.every((a) => has(m, a)))) return "full";
  if (PERM_MODULES.every((m) => has(m, "view") && has(m, "create") && has(m, "edit") && !has(m, "delete")))
    return "editor";
  return "viewer";
}

const PRESET_LABEL: Record<Preset, string> = {
  viewer: "Viewer",
  editor: "Editor",
  full: "Full access",
};

type Account = {
  id: string;
  username: string;
  name: string;
  email: string;
  roleLabel: string;
  permissions: Permissions;
  status: "active" | "suspended";
  hasPassword: boolean;
  updatedAt: number;
};

type ClientLite = { email: string; name: string; eventName: string };

export function TeamAccountsManager() {
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [clients, setClients] = React.useState<ClientLite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState<{ mode: "create" | "edit"; account?: Account } | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [clientPick, setClientPick] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, cRes] = await Promise.all([
        fetch("/api/admin/team-accounts", { cache: "no-store" }),
        fetch("/api/admin/client-assignments", { cache: "no-store" }),
      ]);
      const aData = aRes.ok ? await aRes.json() : {};
      const cData = cRes.ok ? await cRes.json() : {};
      setAccounts(aData.accounts ?? []);
      setClients(
        (cData.assignments ?? []).map((c: { email: string; name: string; eventName: string }) => ({
          email: c.email,
          name: c.name,
          eventName: c.eventName,
        })),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function impersonate(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.redirectTo) {
      window.location.href = data.redirectTo;
    } else {
      alert(data.error ?? "Could not switch accounts.");
    }
  }

  async function toggleStatus(a: Account) {
    setBusyId(a.id);
    try {
      await fetch(`/api/admin/team-accounts/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: a.status === "active" ? "suspended" : "active" }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function setPreset(a: Account, preset: Preset) {
    setBusyId(a.id);
    try {
      await fetch(`/api/admin/team-accounts/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: buildPreset(preset) }),
      });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(a: Account) {
    if (!confirm(`Delete the login for ${a.name}? They will no longer be able to sign in.`)) return;
    setBusyId(a.id);
    try {
      await fetch(`/api/admin/team-accounts/${a.id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Team logins */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
            <KeyRound className="size-4 text-gold-dark" /> Team logins
            <span className="rounded-full bg-line px-2 text-xs font-semibold text-ink-muted">{accounts.length}</span>
          </h2>
          <Button size="sm" onClick={() => setModal({ mode: "create" })}>
            <Plus className="size-4" /> Add login
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-paper py-12 text-sm text-ink-muted">
            <Loader2 className="size-4 animate-spin" /> Loading accounts…
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-paper">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Member</th>
                  <th className="px-4 py-2.5 font-medium">Username</th>
                  <th className="px-4 py-2.5 font-medium">Password</th>
                  <th className="px-4 py-2.5 font-medium">Access</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {accounts.map((a) => (
                  <tr key={a.id} className={cn("transition-colors hover:bg-ivory/50", busyId === a.id && "opacity-50")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={a.name} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-ink">{a.name}</p>
                          <p className="truncate text-xs text-ink-muted">{a.roleLabel}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">{a.username}</td>
                    <td className="px-4 py-3">
                      {a.hasPassword ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success">
                          <Check className="size-3.5" /> Set
                        </span>
                      ) : (
                        <span className="text-xs text-ink-muted">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        aria-label={`Access level for ${a.name}`}
                        value={detectPreset(a.permissions)}
                        onChange={(e) => setPreset(a, e.target.value as Preset)}
                        className="h-8 py-0 text-xs"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="full">Full access</option>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={a.status === "active" ? "success" : "danger"} className="capitalize">
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconBtn
                          label={`Sign in as ${a.name}`}
                          onClick={() =>
                            a.hasPassword || a.status === "active"
                              ? impersonate({ type: "team", id: a.id })
                              : alert("Activate the account first.")
                          }
                          disabled={a.status !== "active"}
                        >
                          <LogIn className="size-4" />
                        </IconBtn>
                        <IconBtn label={`Edit ${a.name}`} onClick={() => setModal({ mode: "edit", account: a })}>
                          <Pencil className="size-4" />
                        </IconBtn>
                        <IconBtn
                          label={a.status === "active" ? "Suspend" : "Reinstate"}
                          onClick={() => toggleStatus(a)}
                        >
                          {a.status === "active" ? <Ban className="size-4" /> : <ShieldCheck className="size-4" />}
                        </IconBtn>
                        <IconBtn label={`Delete ${a.name}`} onClick={() => remove(a)} danger>
                          <Trash2 className="size-4" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
                      No team logins yet. Click “Add login” to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs text-ink-muted">
          Only you (admin) can set or reset passwords — team members cannot change their own.
        </p>
      </section>

      {/* Login as a client */}
      <section>
        <h2 className="mb-2.5 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          <Users className="size-4 text-gold-dark" /> Sign in as a client
        </h2>
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-line bg-paper p-4">
          <div className="min-w-56 flex-1">
            <Field label="Client portal" htmlFor="client-pick">
              <Select id="client-pick" value={clientPick} onChange={(e) => setClientPick(e.target.value)}>
                <option value="">Select a client…</option>
                {clients.map((c) => (
                  <option key={c.email} value={c.email}>
                    {c.name} — {c.eventName}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button
            variant="secondary"
            disabled={!clientPick}
            onClick={() => impersonate({ type: "client", email: clientPick })}
          >
            <LogIn className="size-4" /> Open their portal
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          Opens the client’s portal as them. Use the gold “Return to admin” banner (or visit /exit-impersonation) to switch back.
        </p>
      </section>

      {modal && (
        <AccountModal
          mode={modal.mode}
          account={modal.account}
          onClose={() => setModal(null)}
          onSaved={async () => {
            setModal(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function AccountModal({
  mode,
  account,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  account?: Account;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    username: account?.username ?? "",
    name: account?.name ?? "",
    email: account?.email ?? "",
    roleLabel: account?.roleLabel ?? "",
    status: account?.status ?? ("active" as "active" | "suspended"),
    preset: detectPreset(account?.permissions),
    password: "",
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.username.trim()) return setError("Username is required.");
    if (mode === "create" && form.password && form.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (mode === "edit" && form.password && form.password.length < 6)
      return setError("Password must be at least 6 characters.");

    setSaving(true);
    try {
      const permissions = buildPreset(form.preset);
      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/admin/team-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            name: form.name,
            email: form.email,
            roleLabel: form.roleLabel,
            status: form.status,
            permissions,
            password: form.password || undefined,
          }),
        });
      } else {
        res = await fetch(`/api/admin/team-accounts/${account!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            name: form.name,
            email: form.email,
            roleLabel: form.roleLabel,
            status: form.status,
            permissions,
            ...(form.password ? { password: form.password } : {}),
          }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSaving(false);
        setError(data.error ?? "Could not save.");
        return;
      }
      onSaved();
    } catch {
      setSaving(false);
      setError("Could not save. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-paper shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-xl text-ink">{mode === "create" ? "Add team login" : "Edit login"}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          {error && (
            <p role="alert" className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Username" htmlFor="ta-username">
              <Input id="ta-username" value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="kabir" autoFocus />
            </Field>
            <Field label="Full name" htmlFor="ta-name">
              <Input id="ta-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Kabir Sethi" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" htmlFor="ta-email">
              <Input id="ta-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="kabir@…" />
            </Field>
            <Field label="Title / role" htmlFor="ta-role">
              <Input id="ta-role" value={form.roleLabel} onChange={(e) => set("roleLabel", e.target.value)} placeholder="Head of Production" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Access level" htmlFor="ta-preset">
              <Select id="ta-preset" value={form.preset} onChange={(e) => set("preset", e.target.value as Preset)}>
                <option value="viewer">{PRESET_LABEL.viewer} — read only</option>
                <option value="editor">{PRESET_LABEL.editor} — view/create/edit</option>
                <option value="full">{PRESET_LABEL.full} — incl. delete</option>
              </Select>
            </Field>
            <Field label="Status" htmlFor="ta-status">
              <Select id="ta-status" value={form.status} onChange={(e) => set("status", e.target.value as "active" | "suspended")}>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Select>
            </Field>
          </div>

          <Field
            label={mode === "create" ? "Password" : "Reset password"}
            htmlFor="ta-password"
            hint={mode === "edit" ? (account?.hasPassword ? "Leave blank to keep the current password." : "No password set yet.") : undefined}
          >
            <Input
              id="ta-password"
              type="text"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder={mode === "edit" ? "•••••• (unchanged)" : "Choose a password"}
              autoComplete="new-password"
            />
          </Field>

          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {mode === "create" ? "Create login" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ivory disabled:cursor-not-allowed disabled:opacity-40",
        danger ? "hover:text-danger" : "hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Inbox, Plus, Pencil, Trash2, X, Mail, Phone, Loader2, ListChecks, Wallet, ClipboardList, CheckCircle2, Circle, AlertCircle, Clock3 } from "lucide-react";
import { UploadDocumentButton } from "@/components/internal/upload-document-button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Label } from "@/components/ui/field";
import { formatDate, cn, numberToWords, parseBudgetNumber } from "@/lib/utils";
import {
  CLIENT_STATUS_VARIANT,
  teamMembers,
  memberName,
  PRIORITY_LABEL,
  PRIORITY_VARIANT,
  type ClientStatus,
  type CrmClient,
  type TaskPriority,
  type TaskStage,
  type Task,
} from "@/lib/internal-data";
import type { ClientBudgetLine, ClientMilestone, MilestoneStatus } from "@/lib/store";

const STATUSES: ClientStatus[] = ["lead", "active", "past"];

const PIPELINE: { status: ClientStatus; label: string; blurb: string }[] = [
  { status: "lead", label: "Leads", blurb: "Awaiting first consultation" },
  { status: "active", label: "Active", blurb: "In planning or booked" },
  { status: "past", label: "Past", blurb: "Completed events" },
];

type PortalRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  since: string;
  eventType: string;
  eventName: string;
  eventDate: string;
  venue: string;
  location: string;
  guestCount?: string;
  budget?: string;
  assignedTeam?: string[];
  isPortal: true;
};

export function ClientsTable({ portalRows = [] }: { portalRows?: PortalRow[] }) {
  const router = useRouter();
  const [list, setList] = React.useState<CrmClient[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CrmClient | null>(null);
  const [editingPortal, setEditingPortal] = React.useState<PortalRow | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data/clients", { cache: "no-store" });
      const data = await res.json();
      setList(data.items ?? []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // Portal clients count as "active"
  const counts = React.useMemo(() => {
    const c: Record<string, number> = { active: portalRows.length };
    for (const cl of list) c[cl.status] = (c[cl.status] ?? 0) + 1;
    return c;
  }, [list, portalRows]);

  const filteredPortal = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return portalRows;
    return portalRows.filter(
      (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q),
    );
  }, [portalRows, query]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.source.toLowerCase().includes(q),
    );
  }, [list, query]);

  async function handleDelete(c: CrmClient) {
    if (!confirm(`Delete "${c.name}"? This can't be undone.`)) return;
    await fetch(`/api/admin/data/clients/${c.id}`, { method: "DELETE" });
    await load();
  }

  async function handleDeletePortal(r: PortalRow) {
    if (!confirm(`Remove "${r.name}" from the client portal? This can't be undone.`)) return;
    await fetch(`/api/admin/client-assignments/${encodeURIComponent(r.email)}`, { method: "DELETE" });
    router.refresh();
  }

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (c: CrmClient) => {
    setEditing(c);
    setModalOpen(true);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "1") {
      setEditing(null);
      setModalOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <div className="space-y-5">
      {/* Inquiry pipeline summary */}
      <div className="grid grid-cols-3 gap-3">
        {PIPELINE.map((p) => (
          <div key={p.status} className="rounded-lg border border-line bg-paper p-4">
            <div className="flex items-center justify-between">
              <Badge variant={CLIENT_STATUS_VARIANT[p.status]} dot>{p.label}</Badge>
              <span className="font-serif text-2xl text-ink">{counts[p.status] ?? 0}</span>
            </div>
            <p className="mt-2 text-xs text-ink-muted">{p.blurb}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, source…"
            className="h-9 w-full rounded-md border border-line-strong bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
          />
        </div>
        <Button size="sm" onClick={openCreate} className="shrink-0 sm:self-auto self-start">
          <Plus className="size-4" /> Add client
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-paper py-16 text-sm text-ink-muted">
          <Loader2 className="size-4 animate-spin" /> Loading clients…
        </div>
      ) : rows.length === 0 && filteredPortal.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={query ? "No matching clients" : "No clients yet"}
          description={
            query
              ? "Try a different search term."
              : "Add your first client to start building the pipeline."
          }
          action={
            query ? undefined : (
              <Button size="sm" onClick={openCreate}>
                <Plus className="size-4" /> Add client
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-lg border border-line bg-paper md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Client</th>
                  <th className="px-4 py-2.5 font-medium">Contact</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Source</th>
                  <th className="px-4 py-2.5 text-center font-medium">Events</th>
                  <th className="px-4 py-2.5 font-medium">Since</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {/* Portal clients — shown at top, read-only */}
                {filteredPortal.map((r) => (
                  <tr key={r.id} className="bg-gold-soft/30 transition-colors hover:bg-gold-soft/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.name} size="sm" />
                        <div>
                          <span className="font-medium text-ink">{r.name}</span>
                          <Badge variant="gold" className="ml-2 text-[10px]">Portal</Badge>
                          {(r.assignedTeam ?? []).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(r.assignedTeam ?? []).map((id) => (
                                <span key={id} className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium text-gold-deep">
                                  {memberName(id).split(" ")[0]}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      <p className="flex items-center gap-1.5"><Mail className="size-3.5 text-ink-muted" /> {r.email}</p>
                      {r.phone && <p className="mt-0.5 flex items-center gap-1.5"><Phone className="size-3.5 text-ink-muted" /> {r.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{r.eventType}</td>
                    <td className="px-4 py-3 text-center text-ink">1</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(r.since)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn label="Edit portal client" onClick={() => setEditingPortal(r)}>
                          <Pencil className="size-4" />
                        </IconBtn>
                        <IconBtn label="Delete portal client" onClick={() => handleDeletePortal(r)} danger>
                          <Trash2 className="size-4" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Regular CRM clients */}
                {rows.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-ivory/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size="sm" />
                        <span className="font-medium text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      <p className="flex items-center gap-1.5"><Mail className="size-3.5 text-ink-muted" /> {c.email}</p>
                      <p className="mt-0.5 flex items-center gap-1.5"><Phone className="size-3.5 text-ink-muted" /> {c.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={CLIENT_STATUS_VARIANT[c.status]} className="capitalize">{c.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">{c.source}</td>
                    <td className="px-4 py-3 text-center text-ink">{c.eventsCount}</td>
                    <td className="px-4 py-3 text-ink-soft">{formatDate(c.since)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn label="Edit" onClick={() => openEdit(c)}><Pencil className="size-4" /></IconBtn>
                        <IconBtn label="Delete" onClick={() => handleDelete(c)} danger><Trash2 className="size-4" /></IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="space-y-2.5 md:hidden">
            {filteredPortal.map((r) => (
              <div key={r.id} className="rounded-lg border border-gold/25 bg-gold-soft/30 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={r.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{r.name}</p>
                      <p className="truncate text-xs text-ink-muted">{r.eventType}</p>
                    </div>
                  </div>
                  <Badge variant="gold">Portal</Badge>
                </div>
                <div className="mt-3 space-y-1 text-xs text-ink-soft">
                  <p className="flex items-center gap-1.5"><Mail className="size-3.5 text-ink-muted" /> {r.email}</p>
                  {r.phone && <p className="flex items-center gap-1.5"><Phone className="size-3.5 text-ink-muted" /> {r.phone}</p>}
                  <p className="text-ink-muted">Since {formatDate(r.since)}</p>
                </div>
                {(r.assignedTeam ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(r.assignedTeam ?? []).map((id) => (
                      <span key={id} className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium text-gold-deep">
                        {memberName(id).split(" ")[0]}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-2 border-t border-gold/20 pt-3">
                  <Button size="sm" variant="secondary" onClick={() => setEditingPortal(r)} className="flex-1">
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeletePortal(r)} className="text-danger">
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
            {rows.map((c) => (
              <div key={c.id} className="rounded-lg border border-line bg-paper p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={c.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{c.name}</p>
                      <p className="truncate text-xs text-ink-muted">{c.source} · {c.eventsCount} events</p>
                    </div>
                  </div>
                  <Badge variant={CLIENT_STATUS_VARIANT[c.status]} className="capitalize">{c.status}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-xs text-ink-soft">
                  <p className="flex items-center gap-1.5"><Mail className="size-3.5 text-ink-muted" /> {c.email}</p>
                  <p className="flex items-center gap-1.5"><Phone className="size-3.5 text-ink-muted" /> {c.phone}</p>
                  <p className="text-ink-muted">Since {formatDate(c.since)}</p>
                </div>
                <div className="mt-3 flex gap-2 border-t border-line pt-3">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(c)} className="flex-1">
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(c)} className="text-danger">
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <ClientFormModal
          client={editing}
          onClose={() => setModalOpen(false)}
          onSaved={async () => {
            setModalOpen(false);
            await load();
          }}
        />
      )}

      {editingPortal && (
        <PortalClientEditModal
          row={editingPortal}
          onClose={() => setEditingPortal(null)}
          onSaved={() => {
            setEditingPortal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function ClientFormModal({
  client,
  onClose,
  onSaved,
}: {
  client: CrmClient | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: client?.name ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    status: client?.status ?? ("lead" as ClientStatus),
    source: client?.source ?? "",
    eventsCount: client?.eventsCount ?? 0,
    since: client?.since ?? "",
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
    if (!form.name.trim()) return setError("Client name is required.");
    setSaving(true);
    const res = await fetch(
      client ? `/api/admin/data/clients/${client.id}` : "/api/admin/data/clients",
      {
        method: client ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setSaving(false);
      setError(d.error ?? "Could not save. Please try again.");
      return;
    }
    onSaved();
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
          <h2 className="font-serif text-xl text-ink">{client ? "Edit client" : "Add client"}</h2>
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
          <Field label="Name" htmlFor="cl-name" required>
            <Input id="cl-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Aanya & Vikram Mehra" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email" htmlFor="cl-email">
              <Input id="cl-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="aanya.mehra@gmail.com" />
            </Field>
            <Field label="Phone" htmlFor="cl-phone">
              <Input id="cl-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98100 22841" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Status" htmlFor="cl-status">
              <Select id="cl-status" value={form.status} onChange={(e) => set("status", e.target.value as ClientStatus)}>
                {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </Select>
            </Field>
            <Field label="Source" htmlFor="cl-source">
              <Input id="cl-source" value={form.source} onChange={(e) => set("source", e.target.value)} placeholder="Referral" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Events" htmlFor="cl-events">
              <Input id="cl-events" type="number" min={0} value={form.eventsCount} onChange={(e) => set("eventsCount", Number(e.target.value))} />
            </Field>
            <Field label="Client since" htmlFor="cl-since">
              <Input id="cl-since" type="date" value={form.since} onChange={(e) => set("since", e.target.value)} />
            </Field>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>{client ? "Save changes" : "Add client"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PortalClientEditModal({
  row,
  onClose,
  onSaved,
}: {
  row: PortalRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [tab, setTab] = React.useState<"details" | "budget" | "checklist" | "tasks" | "documents">("details");
  const [form, setForm] = React.useState({
    name: row.name,
    phone: row.phone ?? "",
    eventName: row.eventName,
    eventType: row.eventType,
    eventDate: row.eventDate,
    venue: row.venue,
    location: row.location,
    guestCount: row.guestCount ?? "",
    budget: row.budget ?? "",
    assignedTeam: row.assignedTeam ?? [],
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const toggleTeam = (id: string) =>
    setForm((f) => ({
      ...f,
      assignedTeam: f.assignedTeam.includes(id)
        ? f.assignedTeam.filter((m) => m !== id)
        : [...f.assignedTeam, id],
    }));

  // ── Tasks tab state ──
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = React.useState(false);
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [newTask, setNewTask] = React.useState({
    title: "",
    assignee: teamMembers[0]?.name ?? "",
    due: "",
    priority: "med" as TaskPriority,
    stage: "todo" as TaskStage,
  });
  const [savingTask, setSavingTask] = React.useState(false);

  // ── Budget tab state ──
  const [budgetTotal, setBudgetTotal] = React.useState<number>(0);
  const [budgetLines, setBudgetLines] = React.useState<ClientBudgetLine[]>([]);
  const [loadingBudget, setLoadingBudget] = React.useState(false);
  const [savingBudget, setSavingBudget] = React.useState(false);
  const [showAddLine, setShowAddLine] = React.useState(false);
  const [newLine, setNewLine] = React.useState<ClientBudgetLine>({ category: "", allocated: 0, spent: 0, status: "due" });

  // ── Checklist tab state ──
  const [checklist, setChecklist] = React.useState<ClientMilestone[]>([]);
  const [loadingChecklist, setLoadingChecklist] = React.useState(false);
  const [savingChecklist, setSavingChecklist] = React.useState(false);
  const [showAddMilestone, setShowAddMilestone] = React.useState(false);
  const [newMilestone, setNewMilestone] = React.useState<Omit<ClientMilestone, "id">>({
    title: "", description: "", due: "", status: "pending", owner: "Jasminetals",
  });

  const eventId = `portal-${row.email}`;

  React.useEffect(() => {
    if (tab !== "tasks") return;
    setLoadingTasks(true);
    fetch("/api/admin/data/tasks", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setTasks((d.items ?? []).filter((t: Task) => t.eventId === eventId)))
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false));
  }, [tab, eventId]);

  React.useEffect(() => {
    if (tab !== "budget") return;
    setLoadingBudget(true);
    fetch(`/api/admin/portal-data?email=${encodeURIComponent(row.email)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.budget) {
          setBudgetTotal(d.data.budget.total ?? 0);
          setBudgetLines(d.data.budget.lines ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBudget(false));
  }, [tab, row.email]);

  React.useEffect(() => {
    if (tab !== "checklist") return;
    setLoadingChecklist(true);
    fetch(`/api/admin/portal-data?email=${encodeURIComponent(row.email)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.milestones) setChecklist(d.data.milestones);
      })
      .catch(() => {})
      .finally(() => setLoadingChecklist(false));
  }, [tab, row.email]);

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.title.trim() || !newTask.due) return;
    setSavingTask(true);
    const res = await fetch("/api/admin/data/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, eventId }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.item) {
      setTasks((prev) => [...prev, d.item]);
      setNewTask({ title: "", assignee: teamMembers[0]?.name ?? "", due: "", priority: "med", stage: "todo" });
      setShowAddTask(false);
    }
    setSavingTask(false);
  }

  async function removeTask(id: string) {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/admin/data/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function saveBudget() {
    setSavingBudget(true);
    await fetch("/api/admin/portal-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: row.email, budget: { total: budgetTotal, lines: budgetLines } }),
    });
    setSavingBudget(false);
  }

  async function saveChecklist() {
    setSavingChecklist(true);
    await fetch("/api/admin/portal-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: row.email, milestones: checklist }),
    });
    setSavingChecklist(false);
  }

  function addLine(e: React.FormEvent) {
    e.preventDefault();
    if (!newLine.category.trim()) return;
    setBudgetLines((prev) => [...prev, { ...newLine }]);
    setNewLine({ category: "", allocated: 0, spent: 0, status: "due" });
    setShowAddLine(false);
  }

  function updateLine(idx: number, patch: Partial<ClientBudgetLine>) {
    setBudgetLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function removeLine(idx: number) {
    setBudgetLines((prev) => prev.filter((_, i) => i !== idx));
  }

  function addMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!newMilestone.title.trim()) return;
    const id = `m-${Date.now()}`;
    setChecklist((prev) => [...prev, { ...newMilestone, id }]);
    setNewMilestone({ title: "", description: "", due: "", status: "pending", owner: "Jasminetals" });
    setShowAddMilestone(false);
  }

  function updateMilestoneStatus(id: string, status: MilestoneStatus) {
    setChecklist((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  }

  function removeMilestone(id: string) {
    setChecklist((prev) => prev.filter((m) => m.id !== id));
  }

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const set = <K extends keyof typeof form>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setError("Name is required.");
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/clients/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: row.email, ...form }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Could not save.");
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
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
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-xl bg-paper shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-serif text-xl text-ink">{row.name}</h2>
            <p className="text-xs text-ink-muted">{row.email}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink">
            <X className="size-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-line overflow-x-auto">
          {(["details", "budget", "checklist", "tasks", "documents"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "shrink-0 px-4 py-2.5 text-sm font-medium capitalize transition-colors",
                tab === t
                  ? "border-b-2 border-gold text-gold-deep"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {t === "tasks" ? (
                <span className="flex items-center gap-1.5">
                  <ListChecks className="size-3.5" /> Tasks
                  {tasks.length > 0 && (
                    <span className="rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-semibold text-gold-deep">{tasks.length}</span>
                  )}
                </span>
              ) : t === "budget" ? (
                <span className="flex items-center gap-1.5"><Wallet className="size-3.5" /> Budget</span>
              ) : t === "checklist" ? (
                <span className="flex items-center gap-1.5"><ClipboardList className="size-3.5" /> Checklist
                  {checklist.length > 0 && (
                    <span className="rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-semibold text-gold-deep">{checklist.length}</span>
                  )}
                </span>
              ) : t}
            </button>
          ))}
        </div>

        {tab === "details" && (
          <form onSubmit={save} className="flex flex-col gap-4 p-6">
            {error && (
              <p role="alert" className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Client name" htmlFor="pc-name" required>
                <Input id="pc-name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Phone" htmlFor="pc-phone">
                <Input id="pc-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98100 00000" />
              </Field>
            </div>

            <div className="rounded-lg border border-line bg-ivory px-4 py-2.5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Event details</p>
              <div className="flex flex-col gap-3">
                <Field label="Event name" htmlFor="pc-ename">
                  <Input id="pc-ename" value={form.eventName} onChange={(e) => set("eventName", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Event type" htmlFor="pc-etype">
                    <Input id="pc-etype" value={form.eventType} onChange={(e) => set("eventType", e.target.value)} />
                  </Field>
                  <Field label="Event date" htmlFor="pc-edate">
                    <Input id="pc-edate" type="date" value={form.eventDate} onChange={(e) => set("eventDate", e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Venue" htmlFor="pc-venue">
                    <Input id="pc-venue" value={form.venue} onChange={(e) => set("venue", e.target.value)} />
                  </Field>
                  <Field label="City / location" htmlFor="pc-loc">
                    <Input id="pc-loc" value={form.location} onChange={(e) => set("location", e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Guest count" htmlFor="pc-guests">
                    <Input id="pc-guests" value={form.guestCount} onChange={(e) => set("guestCount", e.target.value)} placeholder="e.g. 150" />
                  </Field>
                  <Field label="Budget" htmlFor="pc-budget">
                    <Input id="pc-budget" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="e.g. 2000000" />
                    {parseBudgetNumber(form.budget ?? "") !== null && (
                      <p className="mt-1 text-xs text-gold-dark">{numberToWords(parseBudgetNumber(form.budget ?? "")!)}</p>
                    )}
                  </Field>
                </div>
              </div>
            </div>

            <div>
              <Label>Assign team</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {teamMembers.map((m) => {
                  const on = form.assignedTeam.includes(m.id);
                  return (
                    <button type="button" key={m.id} onClick={() => toggleTeam(m.id)}
                      className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                        on ? "border-gold/40 bg-gold-soft text-gold-deep" : "border-line-strong bg-paper text-ink-soft hover:bg-ivory")}>
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={saving}>Save changes</Button>
            </div>
          </form>
        )}

        {tab === "budget" && (
          <div className="flex flex-col gap-4 p-6">
            {/* Total budget */}
            <div className="rounded-lg border border-line bg-ivory p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Total budget</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-ink-soft">₹</span>
                <input
                  id="pb-total"
                  type="number"
                  min={0}
                  value={budgetTotal}
                  onChange={(e) => setBudgetTotal(Number(e.target.value))}
                  placeholder="e.g. 2000000"
                  className="flex-1 rounded-md border border-line-strong bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                />
              </div>
              {budgetTotal > 0 && (
                <p className="mt-1.5 text-xs text-gold-dark">{numberToWords(budgetTotal)}</p>
              )}
            </div>

            {/* Budget lines */}
            {loadingBudget ? (
              <div className="flex justify-center py-6 text-ink-muted"><Loader2 className="size-5 animate-spin" /></div>
            ) : (
              <div className="space-y-2">
                {budgetLines.length === 0 && !showAddLine && (
                  <p className="rounded-lg border border-dashed border-line-strong py-6 text-center text-sm text-ink-muted">
                    No budget lines yet — add one below.
                  </p>
                )}
                {budgetLines.map((l, i) => {
                  const pct = l.allocated > 0 ? Math.min(100, Math.round((l.spent / l.allocated) * 100)) : 0;
                  const STATUS_CLS = {
                    paid: "bg-success-soft text-success",
                    partial: "bg-warning-soft text-warning",
                    due: "bg-ivory text-ink-muted border border-line-strong",
                  };
                  return (
                    <div key={i} className="rounded-lg border border-line bg-paper p-3.5">
                      {/* Category row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <input
                          value={l.category}
                          onChange={(e) => updateLine(i, { category: e.target.value })}
                          placeholder="Category name"
                          className="flex-1 rounded border border-transparent bg-transparent text-sm font-medium text-ink placeholder:text-ink-muted hover:border-line focus:border-gold focus:bg-ivory focus:outline-none focus:px-2 focus:py-0.5 transition-all"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <select
                            value={l.status}
                            onChange={(e) => updateLine(i, { status: e.target.value as "paid" | "partial" | "due" })}
                            className={cn("rounded-full border-0 px-2.5 py-0.5 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-gold/20", STATUS_CLS[l.status])}
                          >
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="due">Due</option>
                          </select>
                          <button onClick={() => removeLine(i)} aria-label="Remove line" className="rounded p-0.5 text-ink-muted hover:text-danger">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      {/* Amounts row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Allocated (₹)</p>
                          <input
                            type="number" min={0} value={l.allocated}
                            onChange={(e) => updateLine(i, { allocated: Number(e.target.value) })}
                            className="w-full rounded-md border border-line-strong bg-ivory px-2.5 py-1.5 text-sm tabular-nums text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                          />
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Spent (₹)</p>
                          <input
                            type="number" min={0} value={l.spent}
                            onChange={(e) => updateLine(i, { spent: Number(e.target.value) })}
                            className="w-full rounded-md border border-line-strong bg-ivory px-2.5 py-1.5 text-sm tabular-nums text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                          />
                        </div>
                      </div>
                      {/* Progress bar */}
                      {l.allocated > 0 && (
                        <div className="mt-2.5">
                          <div className="flex justify-between text-[10px] text-ink-muted mb-1">
                            <span>{pct}% used</span>
                            <span>₹{(l.allocated - l.spent).toLocaleString("en-IN")} remaining</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-line-strong overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", l.status === "paid" ? "bg-success" : pct > 90 ? "bg-warning" : "bg-gold")}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {showAddLine ? (
              <form onSubmit={addLine} className="flex flex-col gap-3 rounded-lg border border-gold/30 bg-gold-soft/20 p-4">
                <Field label="Category name" htmlFor="bl-cat">
                  <Input id="bl-cat" value={newLine.category} onChange={(e) => setNewLine((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Catering" autoFocus />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Allocated (₹)" htmlFor="bl-alloc">
                    <Input id="bl-alloc" type="number" min={0} value={newLine.allocated} onChange={(e) => setNewLine((f) => ({ ...f, allocated: Number(e.target.value) }))} />
                  </Field>
                  <Field label="Spent (₹)" htmlFor="bl-spent">
                    <Input id="bl-spent" type="number" min={0} value={newLine.spent} onChange={(e) => setNewLine((f) => ({ ...f, spent: Number(e.target.value) }))} />
                  </Field>
                </div>
                <Field label="Status" htmlFor="bl-status">
                  <Select id="bl-status" value={newLine.status} onChange={(e) => setNewLine((f) => ({ ...f, status: e.target.value as "paid" | "partial" | "due" }))}>
                    <option value="due">Due</option>
                    <option value="partial">Partially paid</option>
                    <option value="paid">Fully paid</option>
                  </Select>
                </Field>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddLine(false)}>Cancel</Button>
                  <Button type="submit" size="sm">Add line</Button>
                </div>
              </form>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setShowAddLine(true)} className="self-start">
                <Plus className="size-4" /> Add line
              </Button>
            )}

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
              <Button type="button" loading={savingBudget} onClick={saveBudget}>Save budget</Button>
            </div>
          </div>
        )}

        {tab === "checklist" && (
          <div className="flex flex-col gap-4 p-6">
            {loadingChecklist ? (
              <div className="flex justify-center py-6 text-ink-muted"><Loader2 className="size-5 animate-spin" /></div>
            ) : checklist.length === 0 && !showAddMilestone ? (
              <p className="py-8 text-center text-sm text-ink-muted">No checklist items yet for this client.</p>
            ) : (
              <ul className="space-y-2">
                {checklist.map((m) => {
                  const STATUS_OPTS: { value: MilestoneStatus; label: string }[] = [
                    { value: "pending", label: "Pending" },
                    { value: "in-progress", label: "In progress" },
                    { value: "action-needed", label: "Action needed" },
                    { value: "done", label: "Done" },
                  ];
                  const STATUS_COLOR: Record<MilestoneStatus, string> = {
                    done: "bg-success-soft text-success",
                    "in-progress": "bg-info-soft text-info",
                    "action-needed": "bg-warning-soft text-warning",
                    pending: "bg-ivory text-ink-muted",
                  };
                  return (
                    <li key={m.id} className="flex items-start gap-3 rounded-lg border border-line bg-ivory p-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-ink">{m.title}</p>
                        {m.description && <p className="mt-0.5 text-xs text-ink-soft">{m.description}</p>}
                        <p className="mt-1 text-xs text-ink-muted">Due {m.due ? formatDate(m.due) : "—"} · {m.owner}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <select
                          value={m.status}
                          onChange={(e) => updateMilestoneStatus(m.id, e.target.value as MilestoneStatus)}
                          className={cn("rounded-full border-0 px-2.5 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gold/25", STATUS_COLOR[m.status])}
                        >
                          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <button onClick={() => removeMilestone(m.id)} aria-label="Remove" className="rounded p-0.5 text-ink-muted hover:text-danger">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {showAddMilestone ? (
              <form onSubmit={addMilestone} className="flex flex-col gap-3 rounded-lg border border-line bg-ivory p-4">
                <Field label="Title" htmlFor="pm-title">
                  <Input id="pm-title" value={newMilestone.title} onChange={(e) => setNewMilestone((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Guest list confirmed" autoFocus />
                </Field>
                <Field label="Description (optional)" htmlFor="pm-desc">
                  <Input id="pm-desc" value={newMilestone.description} onChange={(e) => setNewMilestone((f) => ({ ...f, description: e.target.value }))} placeholder="More details…" />
                </Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Due date" htmlFor="pm-due">
                    <Input id="pm-due" type="date" value={newMilestone.due} onChange={(e) => setNewMilestone((f) => ({ ...f, due: e.target.value }))} />
                  </Field>
                  <Field label="Status" htmlFor="pm-status">
                    <Select id="pm-status" value={newMilestone.status} onChange={(e) => setNewMilestone((f) => ({ ...f, status: e.target.value as MilestoneStatus }))}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In progress</option>
                      <option value="action-needed">Action needed</option>
                      <option value="done">Done</option>
                    </Select>
                  </Field>
                  <Field label="Owner" htmlFor="pm-owner">
                    <Select id="pm-owner" value={newMilestone.owner} onChange={(e) => setNewMilestone((f) => ({ ...f, owner: e.target.value as "Jasminetals"|"You" }))}>
                      <option value="Jasminetals">Jasminetals</option>
                      <option value="You">Client</option>
                    </Select>
                  </Field>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddMilestone(false)}>Cancel</Button>
                  <Button type="submit" size="sm">Add item</Button>
                </div>
              </form>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setShowAddMilestone(true)} className="self-start">
                <Plus className="size-4" /> Add checklist item
              </Button>
            )}

            <div className="flex justify-end gap-2 border-t border-line pt-4">
              <Button type="button" variant="secondary" onClick={onClose}>Close</Button>
              <Button type="button" loading={savingChecklist} onClick={saveChecklist}>Save checklist</Button>
            </div>
          </div>
        )}

        {tab === "tasks" && (
          <div className="flex flex-col gap-4 p-6">
            {loadingTasks ? (
              <div className="flex justify-center py-8 text-ink-muted">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : tasks.length === 0 && !showAddTask ? (
              <p className="py-8 text-center text-sm text-ink-muted">No tasks yet for this client.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-ivory px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                      <p className="text-xs text-ink-muted">
                        {t.assignee} · due {formatDate(t.due)} · <span className="capitalize">{t.stage.replace("-", " ")}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={PRIORITY_VARIANT[t.priority]}>{PRIORITY_LABEL[t.priority]}</Badge>
                      <button onClick={() => removeTask(t.id)} aria-label="Delete task"
                        className="rounded p-0.5 text-ink-muted hover:text-danger">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {showAddTask ? (
              <form onSubmit={addTask} className="flex flex-col gap-3 rounded-lg border border-line bg-ivory p-4">
                <Field label="Task title" htmlFor="pt-title">
                  <Input
                    id="pt-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Confirm catering menu"
                    autoFocus
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Assignee" htmlFor="pt-assignee">
                    <Select id="pt-assignee" value={newTask.assignee}
                      onChange={(e) => setNewTask((f) => ({ ...f, assignee: e.target.value }))}>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.name}>{m.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Due date" htmlFor="pt-due">
                    <Input id="pt-due" type="date" value={newTask.due}
                      onChange={(e) => setNewTask((f) => ({ ...f, due: e.target.value }))} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Priority" htmlFor="pt-priority">
                    <Select id="pt-priority" value={newTask.priority}
                      onChange={(e) => setNewTask((f) => ({ ...f, priority: e.target.value as TaskPriority }))}>
                      <option value="low">Low</option>
                      <option value="med">Medium</option>
                      <option value="high">High</option>
                    </Select>
                  </Field>
                  <Field label="Stage" htmlFor="pt-stage">
                    <Select id="pt-stage" value={newTask.stage}
                      onChange={(e) => setNewTask((f) => ({ ...f, stage: e.target.value as TaskStage }))}>
                      <option value="todo">To do</option>
                      <option value="in-progress">In progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </Select>
                  </Field>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowAddTask(false)}>Cancel</Button>
                  <Button type="submit" size="sm" loading={savingTask}>Add task</Button>
                </div>
              </form>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setShowAddTask(true)} className="self-start">
                <Plus className="size-4" /> Add task
              </Button>
            )}
          </div>
        )}

        {tab === "documents" && (
          <div className="flex flex-col gap-4 p-6">
            <p className="text-sm text-ink-soft">
              Upload contracts, invoices or any file for this client. They can download everything from their portal.
            </p>
            <UploadDocumentButton email={row.email} />
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ivory",
        danger ? "hover:text-danger" : "hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

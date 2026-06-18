"use client";

import * as React from "react";
import { CalendarDays, GripVertical, Plus, Pencil, Trash2, X, Loader2, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { cn, formatDate } from "@/lib/utils";
import {
  PRIORITY_LABEL,
  PRIORITY_VARIANT,
  teamMembers,
  type InternalEvent,
  type Task,
  type TaskStage,
  type TaskPriority,
} from "@/lib/internal-data";
import type { ClientAssignment } from "@/lib/store";

type EventOption = { id: string; label: string };

const COLUMNS: { stage: TaskStage; label: string }[] = [
  { stage: "todo", label: "To do" },
  { stage: "in-progress", label: "In progress" },
  { stage: "review", label: "Review" },
  { stage: "done", label: "Done" },
];

const STAGE_LABEL: Record<TaskStage, string> = {
  todo: "To do",
  "in-progress": "In progress",
  review: "Review",
  done: "Done",
};

const PRIORITIES = Object.keys(PRIORITY_LABEL) as TaskPriority[];

export function Kanban() {
  const [items, setItems] = React.useState<Task[]>([]);
  const [liveEvents, setLiveEvents] = React.useState<InternalEvent[]>([]);
  const [portalClients, setPortalClients] = React.useState<ClientAssignment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overStage, setOverStage] = React.useState<TaskStage | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Task | null>(null);

  // Unified event options: LIVE events from the store + portal clients, so
  // admin-created events are assignable and task cards resolve their label.
  const eventOptions = React.useMemo<EventOption[]>(() => [
    ...liveEvents.map((e) => ({ id: e.id, label: e.client })),
    ...portalClients.map((p) => ({ id: `portal-${p.email}`, label: `${p.name} — ${p.eventName}` })),
  ], [liveEvents, portalClients]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, evRes, ptRes] = await Promise.all([
        fetch("/api/admin/data/tasks", { cache: "no-store" }),
        fetch("/api/admin/events", { cache: "no-store" }),
        fetch("/api/admin/client-assignments", { cache: "no-store" }),
      ]);
      const taskData = await taskRes.json();
      const evData = evRes.ok ? await evRes.json() : {};
      const ptData = ptRes.ok ? await ptRes.json() : {};
      setItems(taskData.items ?? []);
      setLiveEvents(evData.events ?? []);
      setPortalClients(ptData.assignments ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // Persist a stage change on drop. Optimistic, with rollback on failure.
  const persistStage = React.useCallback(async (id: string, stage: TaskStage) => {
    const prev = items;
    const target = prev.find((t) => t.id === id);
    if (!target || target.stage === stage) return;
    setItems((list) => list.map((t) => (t.id === id ? { ...t, stage } : t)));
    try {
      const res = await fetch(`/api/admin/data/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (!res.ok) throw new Error("PATCH failed");
    } catch {
      // Roll back to the previous state if the server rejects the move.
      setItems(prev);
    }
  }, [items]);

  const onDrop = (stage: TaskStage) => {
    const id = dragId;
    setDragId(null);
    setOverStage(null);
    if (id) void persistStage(id, stage);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditing(t);
    setModalOpen(true);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "1") {
      setEditing(null);
      setModalOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function handleDelete(t: Task) {
    if (!confirm(`Delete "${t.title}"? This can't be undone.`)) return;
    try {
      await fetch(`/api/admin/data/tasks/${t.id}`, { method: "DELETE" });
    } catch {
      /* ignore network error; refetch reconciles state */
    }
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">
          {items.length} {items.length === 1 ? "task" : "tasks"}
        </p>
        <Button size="sm" onClick={openCreate} className="shrink-0">
          <Plus className="size-4" /> New task
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-paper py-16 text-sm text-ink-muted">
          <Loader2 className="size-4 animate-spin" /> Loading tasks…
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const colTasks = items.filter((t) => t.stage === col.stage);
            const isOver = overStage === col.stage;
            return (
              <div
                key={col.stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverStage(col.stage);
                }}
                onDragLeave={(e) => {
                  // Only clear if leaving the column entirely.
                  if (!e.currentTarget.contains(e.relatedTarget as Node))
                    setOverStage((s) => (s === col.stage ? null : s));
                }}
                onDrop={() => onDrop(col.stage)}
                className={cn(
                  "flex min-h-40 flex-col rounded-lg border bg-ivory/50 transition-colors",
                  isOver ? "border-gold/60 bg-gold-tint" : "border-line",
                )}
              >
                <div className="flex items-center justify-between border-b border-line px-3 py-2.5">
                  <span className="text-sm font-semibold text-ink">{col.label}</span>
                  <span className="rounded-full bg-line px-2 text-xs font-semibold text-ink-muted">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-2">
                  {colTasks.map((t) => {
                    // Resolve the event label from the unified live options
                    // (events + portals), so live-created events show a client.
                    const eventLabel = eventOptions.find((o) => o.id === t.eventId)?.label ?? null;
                    return (
                      <article
                        key={t.id}
                        draggable
                        onDragStart={(e) => {
                          setDragId(t.id);
                          e.dataTransfer.effectAllowed = "move";
                          try {
                            e.dataTransfer.setData("text/plain", t.id);
                          } catch {
                            /* some browsers restrict setData; drag still works via state */
                          }
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverStage(null);
                        }}
                        className={cn(
                          "group rounded-md border border-line bg-paper p-3 shadow-soft transition-opacity",
                          dragId === t.id && "opacity-40",
                        )}
                      >
                        <div className="flex items-start gap-1.5">
                          <GripVertical className="mt-0.5 size-3.5 shrink-0 cursor-grab text-ink-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing" />
                          <p className="text-sm font-medium leading-snug text-ink">{t.title}</p>
                        </div>
                        {eventLabel && (
                          <p className="mt-1 pl-5 text-xs text-ink-muted">
                            {eventLabel}
                          </p>
                        )}
                        <div className="mt-2.5 flex items-center justify-between pl-5">
                          <Badge variant={PRIORITY_VARIANT[t.priority]}>
                            {PRIORITY_LABEL[t.priority]}
                          </Badge>
                          <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                            <CalendarDays className="size-3" /> {formatDate(t.due)}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between pl-5">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <Avatar name={t.assignee} size="sm" />
                            <span className="truncate text-xs text-ink-soft">{t.assignee}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-0.5">
                            <IconBtn label="Edit task" onClick={() => openEdit(t)}>
                              <Pencil className="size-3.5" />
                            </IconBtn>
                            <IconBtn label="Delete task" onClick={() => handleDelete(t)} danger>
                              <Trash2 className="size-3.5" />
                            </IconBtn>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <p className="rounded-md border border-dashed border-line-strong px-3 py-6 text-center text-xs text-ink-muted">
                      Drop tasks here
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line-strong bg-paper py-10 text-center">
          <Inbox className="size-6 text-ink-muted" />
          <div>
            <p className="text-sm font-medium text-ink">No tasks yet</p>
            <p className="text-xs text-ink-muted">Create your first task to get started.</p>
          </div>
          <Button size="sm" onClick={openCreate}>
            <Plus className="size-4" /> New task
          </Button>
        </div>
      )}

      {modalOpen && (
        <TaskFormModal
          task={editing}
          eventOptions={eventOptions}
          onClose={() => setModalOpen(false)}
          onSaved={async () => {
            setModalOpen(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function TaskFormModal({
  task,
  eventOptions,
  onClose,
  onSaved,
}: {
  task: Task | null;
  eventOptions: EventOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    title: task?.title ?? "",
    eventId: task?.eventId ?? (eventOptions[0]?.id ?? ""),
    assignee: task?.assignee ?? (teamMembers[0]?.name ?? ""),
    due: task?.due ?? "",
    priority: task?.priority ?? ("med" as TaskPriority),
    stage: task?.stage ?? ("todo" as TaskStage),
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
    if (!form.title.trim()) return setError("Task title is required.");
    if (!form.due) return setError("Please pick a due date.");
    setSaving(true);
    try {
      const res = await fetch(
        task ? `/api/admin/data/tasks/${task.id}` : "/api/admin/data/tasks",
        {
          method: task ? "PATCH" : "POST",
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
          <h2 className="font-serif text-xl text-ink">{task ? "Edit task" : "New task"}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          {error && (
            <p
              role="alert"
              className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger"
            >
              {error}
            </p>
          )}

          <Field label="Task title" htmlFor="tk-title">
            <Input
              id="tk-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Finalize mandap floral install"
            />
          </Field>

          <Field label="Event" htmlFor="tk-event">
            <Select id="tk-event" value={form.eventId} onChange={(e) => set("eventId", e.target.value)}>
              {eventOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Assignee" htmlFor="tk-assignee">
              <Select
                id="tk-assignee"
                value={form.assignee}
                onChange={(e) => set("assignee", e.target.value)}
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Due date" htmlFor="tk-due">
              <Input
                id="tk-due"
                type="date"
                value={form.due}
                onChange={(e) => set("due", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority" htmlFor="tk-priority">
              <Select
                id="tk-priority"
                value={form.priority}
                onChange={(e) => set("priority", e.target.value as TaskPriority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Stage" htmlFor="tk-stage">
              <Select
                id="tk-stage"
                value={form.stage}
                onChange={(e) => set("stage", e.target.value as TaskStage)}
              >
                {COLUMNS.map((c) => (
                  <option key={c.stage} value={c.stage}>
                    {STAGE_LABEL[c.stage]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {task ? "Save changes" : "Create task"}
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
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-ivory",
        danger ? "hover:text-danger" : "hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

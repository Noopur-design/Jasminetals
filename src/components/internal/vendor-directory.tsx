"use client";

import * as React from "react";
import {
  Star,
  Phone,
  Utensils,
  Palette,
  Camera,
  Building2,
  Music,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Inbox,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import {
  VENDOR_STATUS_VARIANT,
  VENDOR_CATEGORY_LABEL,
  type Vendor,
  type VendorCategory,
  type VendorStatus,
} from "@/lib/internal-data";

const CAT_ICON: Record<VendorCategory, React.ComponentType<{ className?: string }>> = {
  catering: Utensils,
  decor: Palette,
  photography: Camera,
  venue: Building2,
  entertainment: Music,
  makeup: Sparkles,
};

const CATEGORIES = Object.keys(VENDOR_CATEGORY_LABEL) as VendorCategory[];
const STATUSES = Object.keys(VENDOR_STATUS_VARIANT) as VendorStatus[];

type Filter = "all" | VendorCategory;

export function VendorDirectory() {
  const [list, setList] = React.useState<Vendor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Filter>("all");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vendor | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data/vendors", { cache: "no-store" });
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

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: list.length };
    for (const v of list) c[v.category] = (c[v.category] ?? 0) + 1;
    return c;
  }, [list]);

  const rows = React.useMemo(
    () => (filter === "all" ? list : list.filter((v) => v.category === filter)),
    [list, filter],
  );

  const tabs = [
    { value: "all", label: "All", count: counts.all },
    ...CATEGORIES.map((cat) => ({
      value: cat,
      label: VENDOR_CATEGORY_LABEL[cat],
      count: counts[cat] ?? 0,
    })),
  ];

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (v: Vendor) => {
    setEditing(v);
    setModalOpen(true);
  };

  React.useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("new") === "1") {
      setEditing(null);
      setModalOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function handleDelete(v: Vendor) {
    if (!confirm(`Delete "${v.name}"? This can't be undone.`)) return;
    await fetch(`/api/admin/data/vendors/${v.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <Tabs tabs={tabs} value={filter} onValueChange={(v) => setFilter(v as Filter)} size="sm" />
        </div>
        <Button size="sm" onClick={openCreate} className="shrink-0 self-start lg:self-auto">
          <Plus className="size-4" /> Add vendor
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-paper py-16 text-sm text-ink-muted">
          <Loader2 className="size-4 animate-spin" /> Loading vendors…
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={filter === "all" ? "No vendors yet" : "No vendors in this category"}
          description={
            filter === "all"
              ? "Add your first vendor to build your directory."
              : "Try another category, or add a vendor here."
          }
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" /> Add vendor
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((v) => {
            const Icon = CAT_ICON[v.category];
            return (
              <div key={v.id} className="relative flex flex-col rounded-lg border border-line bg-paper p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-gold-soft text-gold-deep">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{v.name}</p>
                      <p className="text-xs text-ink-muted">{VENDOR_CATEGORY_LABEL[v.category]}</p>
                    </div>
                  </div>
                  <Badge variant={VENDOR_STATUS_VARIANT[v.status]} className="shrink-0 capitalize">
                    {v.status}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1 text-xs text-ink-soft">
                  <p className="truncate">{v.contact}</p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-3.5 shrink-0 text-ink-muted" /> {v.phone}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
                    <Star className="size-4 fill-gold text-gold" /> {v.rating.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-1">
                    <IconBtn label="Edit" onClick={() => openEdit(v)}>
                      <Pencil className="size-4" />
                    </IconBtn>
                    <IconBtn label="Delete" onClick={() => handleDelete(v)} danger>
                      <Trash2 className="size-4" />
                    </IconBtn>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <VendorFormModal
          vendor={editing}
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

function VendorFormModal({
  vendor,
  onClose,
  onSaved,
}: {
  vendor: Vendor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: vendor?.name ?? "",
    category: vendor?.category ?? ("catering" as VendorCategory),
    contact: vendor?.contact ?? "",
    phone: vendor?.phone ?? "",
    status: vendor?.status ?? ("pending" as VendorStatus),
    rating: vendor?.rating ?? 0,
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
    if (!form.name.trim()) return setError("Vendor name is required.");
    if (!form.contact.trim()) return setError("Contact name is required.");
    const rating = Math.min(5, Math.max(0, Number(form.rating) || 0));
    setSaving(true);
    const payload = { ...form, rating };
    const res = await fetch(
      vendor ? `/api/admin/data/vendors/${vendor.id}` : "/api/admin/data/vendors",
      {
        method: vendor ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          <h2 className="font-serif text-xl text-ink">{vendor ? "Edit vendor" : "Add vendor"}</h2>
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
            <p role="alert" className="rounded-md border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
              {error}
            </p>
          )}

          <Field label="Vendor name" htmlFor="vn-name">
            <Input
              id="vn-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Saffron & Sage Catering"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" htmlFor="vn-category">
              <Select
                id="vn-category"
                value={form.category}
                onChange={(e) => set("category", e.target.value as VendorCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {VENDOR_CATEGORY_LABEL[c]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Status" htmlFor="vn-status">
              <Select
                id="vn-status"
                value={form.status}
                onChange={(e) => set("status", e.target.value as VendorStatus)}
                className="capitalize"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <Field label="Contact person" htmlFor="vn-contact">
            <Input
              id="vn-contact"
              value={form.contact}
              onChange={(e) => set("contact", e.target.value)}
              placeholder="Imran Qureshi"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone" htmlFor="vn-phone">
              <Input
                id="vn-phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+91 98100 44120"
              />
            </Field>
            <Field label="Rating (0–5)" htmlFor="vn-rating">
              <Input
                id="vn-rating"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => set("rating", Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="mt-2 flex justify-end gap-2 border-t border-line pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {vendor ? "Save changes" : "Add vendor"}
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

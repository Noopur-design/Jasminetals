"use client";

import * as React from "react";
import { CreditCard, Download, Loader2, Check } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Field, Input, Textarea, Select, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";

type Settings = {
  profile: {
    studioName: string;
    contactEmail: string;
    phone: string;
    gstin: string;
    city: string;
    region: string;
    about: string;
  };
  branding: { accent: string; font: string; logoName: string };
  notifications: Record<string, boolean>;
};

const NOTIF_FIELDS: { key: string; label: string; desc: string }[] = [
  { key: "newLeads", label: "New lead enquiries", desc: "When a website enquiry is submitted." },
  { key: "taskAssignments", label: "Task assignments", desc: "When a task is assigned to you." },
  { key: "vendorStatus", label: "Vendor status changes", desc: "Confirmations and pending follow-ups." },
  { key: "budgetOverruns", label: "Budget overruns", desc: "When a category exceeds its allocation." },
  { key: "weeklyDigest", label: "Weekly digest", desc: "Monday summary of the week ahead." },
];

export function SettingsPanels() {
  const [tab, setTab] = React.useState("profile");
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [savingSection, setSavingSection] = React.useState<string | null>(null);
  const [savedSection, setSavedSection] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => setSettings(null));
  }, []);

  function patchProfile<K extends keyof Settings["profile"]>(k: K, v: Settings["profile"][K]) {
    setSettings((s) => (s ? { ...s, profile: { ...s.profile, [k]: v } } : s));
  }
  function patchBranding<K extends keyof Settings["branding"]>(k: K, v: Settings["branding"][K]) {
    setSettings((s) => (s ? { ...s, branding: { ...s.branding, [k]: v } } : s));
  }
  function toggleNotif(k: string) {
    setSettings((s) =>
      s ? { ...s, notifications: { ...s.notifications, [k]: !s.notifications[k] } } : s,
    );
  }

  async function save(section: keyof Settings) {
    if (!settings) return;
    setSavingSection(section);
    setSavedSection(null);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [section]: settings[section] }),
      });
      setSavedSection(section);
      setTimeout(() => setSavedSection((cur) => (cur === section ? null : cur)), 2500);
    } finally {
      setSavingSection(null);
    }
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-line bg-paper py-16 text-sm text-ink-muted">
        <Loader2 className="size-4 animate-spin" /> Loading settings…
      </div>
    );
  }

  const SaveFooter = (section: keyof Settings, label: string) => (
    <>
      {savedSection === section && (
        <span className="flex items-center gap-1 text-sm text-success">
          <Check className="size-4" /> Saved
        </span>
      )}
      <Button size="sm" loading={savingSection === section} onClick={() => save(section)}>
        {label}
      </Button>
    </>
  );

  return (
    <div className="space-y-5">
      <Tabs
        tabs={[
          { value: "profile", label: "Studio profile" },
          { value: "branding", label: "Branding" },
          { value: "billing", label: "Billing & plan" },
          { value: "notifications", label: "Notifications" },
        ]}
        value={tab}
        onValueChange={setTab}
        size="sm"
        className="w-full overflow-x-auto"
      />

      {tab === "profile" && (
        <Panel
          title="Studio profile"
          description="Public-facing studio details used on quotes and invoices."
          footer={SaveFooter("profile", "Save changes")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Studio name">
              <Input value={settings.profile.studioName} onChange={(e) => patchProfile("studioName", e.target.value)} />
            </Field>
            <Field label="Contact email">
              <Input type="email" value={settings.profile.contactEmail} onChange={(e) => patchProfile("contactEmail", e.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={settings.profile.phone} onChange={(e) => patchProfile("phone", e.target.value)} />
            </Field>
            <Field label="GSTIN">
              <Input value={settings.profile.gstin} onChange={(e) => patchProfile("gstin", e.target.value)} />
            </Field>
            <Field label="City">
              <Input value={settings.profile.city} onChange={(e) => patchProfile("city", e.target.value)} />
            </Field>
            <Field label="Region">
              <Select value={settings.profile.region} onChange={(e) => patchProfile("region", e.target.value)}>
                <option value="ncr">Delhi NCR</option>
                <option value="mum">Mumbai</option>
                <option value="blr">Bengaluru</option>
              </Select>
            </Field>
          </div>
          <Field label="About">
            <Textarea value={settings.profile.about} onChange={(e) => patchProfile("about", e.target.value)} />
          </Field>
        </Panel>
      )}

      {tab === "branding" && (
        <Panel
          title="Branding"
          description="Colours and assets applied across the client portal and documents."
          footer={SaveFooter("branding", "Save branding")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Accent colour" hint="Used for buttons and highlights.">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.branding.accent}
                  onChange={(e) => patchBranding("accent", e.target.value)}
                  className="size-9 shrink-0 cursor-pointer rounded-md border border-line-strong bg-paper"
                  aria-label="Accent colour"
                />
                <Input
                  value={settings.branding.accent}
                  onChange={(e) => patchBranding("accent", e.target.value)}
                  className="font-mono"
                />
              </div>
            </Field>
            <Field label="Display font">
              <Select value={settings.branding.font} onChange={(e) => patchBranding("font", e.target.value)}>
                <option value="playfair">Playfair Display</option>
                <option value="cormorant">Cormorant</option>
                <option value="fraunces">Fraunces</option>
              </Select>
            </Field>
          </div>
          <div>
            <Label>Logo</Label>
            <div className="mt-1.5 flex items-center gap-3 rounded-md border border-dashed border-line-strong bg-ivory/60 px-4 py-5">
              <span className="flex size-11 items-center justify-center rounded-full bg-gold-soft font-serif text-lg text-gold-deep ring-1 ring-gold/20">
                J
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{settings.branding.logoName}</p>
                <p className="text-xs text-ink-muted">SVG · 24 KB</p>
              </div>
              <Button size="sm" variant="secondary" className="ml-auto">
                Replace
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {tab === "billing" && <Billing />}

      {tab === "notifications" && (
        <Panel
          title="Notifications"
          description="Choose what lands in your inbox."
          footer={SaveFooter("notifications", "Save preferences")}
        >
          <ul className="divide-y divide-line">
            {NOTIF_FIELDS.map((g) => (
              <li key={g.key} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-ink">{g.label}</p>
                  <p className="text-xs text-ink-muted">{g.desc}</p>
                </div>
                <Toggle on={!!settings.notifications[g.key]} onToggle={() => toggleNotif(g.key)} label={g.label} />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

function Panel({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-line bg-paper">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-ink-soft">{description}</p>}
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
      {footer && <div className="flex items-center justify-end gap-3 border-t border-line bg-ivory/50 px-5 py-3">{footer}</div>}
    </section>
  );
}

function Billing() {
  const lines = [
    { label: "Signature plan", detail: "Billed annually", amount: 96000 },
    { label: "Extra seats (3)", detail: "₹6,000 / seat / yr", amount: 18000 },
  ];
  const total = lines.reduce((s, l) => s + l.amount, 0);
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Panel title="Plan & invoices" description="Current subscription and recent invoices.">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gold/40 bg-gold-tint p-4">
            <div>
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-gold-dark" />
                <p className="font-medium text-ink">Signature</p>
                <Badge variant="gold">Current</Badge>
              </div>
              <p className="mt-1 text-xs text-ink-soft">Renews 1 Jan 2027 · 9 of 12 seats used</p>
            </div>
            <Button size="sm" variant="secondary">Change plan</Button>
          </div>

          <div className="overflow-hidden rounded-md border border-line">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-ivory text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Invoice</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                  <th className="px-4 py-2.5 text-right font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {[
                  { id: "INV-2026-014", date: "01 Jan 2026", amt: 114000 },
                  { id: "INV-2025-118", date: "01 Jan 2025", amt: 108000 },
                ].map((inv) => (
                  <tr key={inv.id} className="hover:bg-ivory/60">
                    <td className="px-4 py-3 font-medium text-ink">{inv.id}</td>
                    <td className="px-4 py-3 text-ink-soft">{inv.date}</td>
                    <td className="px-4 py-3 text-right text-ink">{formatINR(inv.amt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="inline-flex items-center gap-1 text-xs font-medium text-gold-dark hover:underline">
                        <Download className="size-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel title="Billing summary">
        <ul className="space-y-3">
          {lines.map((l) => (
            <li key={l.label} className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">{l.label}</p>
                <p className="text-xs text-ink-muted">{l.detail}</p>
              </div>
              <span className="text-sm text-ink">{formatINR(l.amount)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-line pt-3">
          <span className="text-sm font-medium text-ink">Annual total</span>
          <span className="font-serif text-lg text-ink">{formatINR(total)}</span>
        </div>
        <p className="text-xs text-ink-muted">Plus applicable GST. Next charge 1 Jan 2027.</p>
      </Panel>
    </div>
  );
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? "bg-gold" : "bg-line-strong"}`}
    >
      <span className={`inline-block size-5 transform rounded-full bg-white shadow-soft transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

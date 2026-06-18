"use client";

import * as React from "react";
import { Users, X, Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TeamMember = { id: string; name: string; role: string };

export function AssignTeamButton({
  email,
  currentTeamIds,
  teamMembers,
}: {
  email: string;
  currentTeamIds: string[];
  teamMembers: TeamMember[];
}) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(
    new Set(currentTeamIds),
  );
  const [saving, setSaving] = React.useState(false);
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/clients/assign-team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, teamIds: [...selected] }),
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setSelected(new Set(currentTeamIds)); setOpen(true); }}
        className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold/40 hover:bg-gold-soft hover:text-gold-deep"
      >
        <Users className="size-3.5" />
        {currentTeamIds.length === 0 ? "Assign team" : `Team (${currentTeamIds.length})`}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-line bg-paper shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="font-serif text-lg font-medium text-ink">Assign team</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Team list */}
            <ul className="max-h-72 overflow-y-auto divide-y divide-line px-2 py-2">
              {teamMembers.map((m) => {
                const checked = selected.has(m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                        checked ? "bg-gold-soft" : "hover:bg-ivory",
                      )}
                    >
                      <Avatar name={m.name} size="md" className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{m.name}</p>
                        <p className="truncate text-xs text-ink-muted">{m.role}</p>
                      </div>
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          checked
                            ? "border-gold bg-gold text-on-accent"
                            : "border-line-strong bg-paper",
                        )}
                      >
                        {checked && <Check className="size-3" strokeWidth={3} />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
              <span className="text-xs text-ink-muted">
                {selected.size === 0 ? "No one assigned" : `${selected.size} selected`}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={save} disabled={saving}>
                  {saving && <Loader2 className="size-3.5 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

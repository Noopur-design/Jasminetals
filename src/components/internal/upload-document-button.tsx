"use client";

import * as React from "react";
import { Upload, X, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type DocType = "contract" | "invoice" | "other";

const TYPE_LABELS: Record<DocType, string> = {
  contract: "Contract",
  invoice: "Invoice",
  other: "Document",
};

export function UploadDocumentButton({ email }: { email: string }) {
  const [open, setOpen] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<DocType>("invoice");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  function openModal() {
    setFile(null);
    setName("");
    setType("invoice");
    setError("");
    setDone(false);
    setOpen(true);
  }

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !name) setName(f.name.replace(/\.[^.]+$/, ""));
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("email", email);
      fd.append("name", name.trim());
      fd.append("type", type);
      fd.append("file", file);

      const res = await fetch("/api/admin/clients/upload-document", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Upload failed.");
        return;
      }
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 1200);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-gold/40 hover:bg-gold-soft hover:text-gold-deep"
      >
        <Upload className="size-3.5" />
        Upload doc
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-line bg-paper shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="font-serif text-lg font-medium text-ink">Upload document</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-ink-muted hover:bg-ivory hover:text-ink">
                <X className="size-4" />
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                <CheckCircle2 className="size-10 text-success" />
                <p className="font-medium text-ink">Document uploaded</p>
                <p className="text-sm text-ink-soft">The client can now download it from their portal.</p>
              </div>
            ) : (
              <form onSubmit={upload} className="flex flex-col gap-4 p-5">
                {/* Drop zone */}
                <div
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-7 text-center transition-colors",
                    file ? "border-gold/50 bg-gold-soft" : "border-line-strong hover:border-gold/40 hover:bg-ivory",
                  )}
                >
                  <FileText className={cn("size-8", file ? "text-gold-dark" : "text-ink-muted")} />
                  {file ? (
                    <div>
                      <p className="text-sm font-medium text-ink">{file.name}</p>
                      <p className="text-xs text-ink-muted">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-ink">Click to choose file</p>
                      <p className="text-xs text-ink-muted">PDF, DOCX, XLSX, PNG, JPG — up to 10 MB</p>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    className="sr-only"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={pickFile}
                  />
                </div>

                <Field label="Document name" htmlFor="doc-name" required>
                  <Input
                    id="doc-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Advance Invoice #001"
                    required
                  />
                </Field>

                <Field label="Type" htmlFor="doc-type">
                  <Select id="doc-type" value={type} onChange={(e) => setType(e.target.value as DocType)}>
                    {(Object.keys(TYPE_LABELS) as DocType[]).map((t) => (
                      <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                    ))}
                  </Select>
                </Field>

                {error && (
                  <p className="rounded-md border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
                )}

                <div className="flex justify-end gap-2 border-t border-line pt-3">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={!file || !name.trim() || saving}>
                    {saving && <Loader2 className="size-3.5 animate-spin" />}
                    Upload
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

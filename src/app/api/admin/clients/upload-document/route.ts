import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/server-auth";
import { addClientDocument, type ClientDocument } from "@/lib/store";
import { config } from "@/lib/config";
import { adminBucket, isAdminConfigured } from "@/lib/firebase/admin";
import { safeExtension, isInsideDir, enforceRateLimit } from "@/lib/http";
import { LIMITS } from "@/lib/rate-limit";

const UPLOADS_DIR = path.join(process.cwd(), ".data", "uploads");

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function docId() {
  return `doc-${Date.now().toString(36)}${Math.floor(Math.random() * 9999)}`;
}

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "upload", LIMITS.write);
  if (limited) return limited;
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const type = (formData.get("type") as string) ?? "other";
  const file = formData.get("file") as File | null;

  if (!email || !name || !file) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  if (file.size > config.uploads.maxBytes) {
    return NextResponse.json({ ok: false, error: "File too large (max 10 MB)." }, { status: 413 });
  }

  // The id is server-generated and the extension is sanitised to an allowlisted
  // alphanumeric token — no part of the path comes through raw from the client.
  const id = docId();
  const ext = safeExtension(file.name, config.uploads.allowedExtensions);
  const filename = `${id}.${ext}`;
  const dest = path.join(UPLOADS_DIR, filename);
  if (!isInsideDir(UPLOADS_DIR, dest)) {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  // Re-check the real byte length (a client can lie about file.size).
  if (buffer.length > config.uploads.maxBytes) {
    return NextResponse.json({ ok: false, error: "File too large (max 10 MB)." }, { status: 413 });
  }

  // Production → Firebase Storage (Vercel's filesystem is read-only). Dev → local
  // file. The object is private; it's never handed to the client — the download
  // route fetches it server-side behind the auth/ownership check.
  let storagePath: string | undefined;
  if (isAdminConfigured()) {
    storagePath = `uploads/${filename}`;
    await adminBucket()
      .file(storagePath)
      .save(buffer, { contentType: file.type || "application/octet-stream", resumable: false });
  } else {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.writeFile(dest, buffer);
  }

  const doc: ClientDocument = {
    id,
    name,
    type: type as ClientDocument["type"],
    size: humanSize(buffer.length),
    date: new Date().toISOString().slice(0, 10),
    filename,
    storagePath,
    mimeType: file.type || "application/octet-stream",
  };

  const updated = await addClientDocument(email, doc);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Client portal data not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, document: doc }, { status: 201 });
}

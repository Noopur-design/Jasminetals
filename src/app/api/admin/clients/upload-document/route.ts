import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/server-auth";
import { addClientDocument, type ClientDocument } from "@/lib/store";

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

  const ext = file.name.split(".").pop() ?? "pdf";
  const id = docId();
  const filename = `${id}.${ext}`;

  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);

  const doc: ClientDocument = {
    id,
    name,
    type: type as ClientDocument["type"],
    size: humanSize(buffer.length),
    date: new Date().toISOString().slice(0, 10),
    filename,
    mimeType: file.type || "application/octet-stream",
  };

  const updated = await addClientDocument(email, doc);
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Client portal data not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, document: doc }, { status: 201 });
}

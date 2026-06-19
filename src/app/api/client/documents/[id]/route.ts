import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getClientPortalData, listClientPortalDataAll, type ClientDocument } from "@/lib/store";
import { isInsideDir } from "@/lib/http";

const UPLOADS_DIR = path.join(process.cwd(), ".data", "uploads");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Resolve the REAL document record. A client only ever sees their own; an admin
  // may download any — found by scanning all portals (no fabricated record).
  let doc: ClientDocument | undefined;
  if (session.role === "client" && session.email) {
    const portal = await getClientPortalData(session.email);
    doc = portal?.documents.find((d) => d.id === id);
  } else if (session.role === "admin") {
    for (const p of await listClientPortalDataAll()) {
      const found = p.documents?.find((d) => d.id === id);
      if (found) {
        doc = found;
        break;
      }
    }
  }
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const mimeType = doc.mimeType ?? "application/octet-stream";
  const disposition = `attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`;

  // Production: the file lives in Vercel Blob. The caller is already authorised,
  // so fetch it server-side and stream it — the blob URL never reaches the client.
  if (doc.blobUrl) {
    const upstream = await fetch(doc.blobUrl);
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    return new NextResponse(upstream.body, {
      headers: { "Content-Type": mimeType, "Content-Disposition": disposition },
    });
  }

  // Local dev: read from .data/uploads. `filename` is a server-generated,
  // extension-sanitised token; still containment-check before reading.
  const filePath = path.join(UPLOADS_DIR, doc.filename);
  if (!isInsideDir(UPLOADS_DIR, filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": disposition,
      "Content-Length": String(buffer.length),
    },
  });
}

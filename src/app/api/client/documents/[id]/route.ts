import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getClientPortalData } from "@/lib/store";

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

  // Clients can only download their own documents; admins can download any
  let portalData = null;
  if (session.role === "client" && session.email) {
    portalData = await getClientPortalData(session.email);
  } else if (session.role === "admin") {
    // Admins can access any file — we skip the ownership check
    portalData = { documents: [{ id, filename: `${id}.pdf`, mimeType: "application/octet-stream", name: id }] };
  }

  if (!portalData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = portalData.documents.find((d: { id: string }) => d.id === id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const filePath = path.join(UPLOADS_DIR, (doc as { filename: string }).filename);
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const mimeType = (doc as { mimeType: string }).mimeType ?? "application/octet-stream";
  const name = encodeURIComponent((doc as { name: string }).name);

  // Wrap in a plain Uint8Array — Node's Buffer isn't a valid BodyInit under the
  // strict lib types, but a Uint8Array view over the same bytes is.
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename*=UTF-8''${name}`,
      "Content-Length": String(buffer.length),
    },
  });
}

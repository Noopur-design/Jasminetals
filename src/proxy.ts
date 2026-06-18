import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, dashboardFor, SESSION_COOKIE } from "@/lib/auth";

/**
 * Route protection — two completely separate systems:
 *
 *   /portal   → client session only  → unauthenticated → /login
 *   /internal → admin or team only   → unauthenticated → /admin
 *
 * Login pages bounce already-signed-in users straight to their dashboard.
 * No ?next= params — after login you always land on your dashboard.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  const isPortal   = pathname.startsWith("/portal");
  const isInternal = pathname.startsWith("/internal");
  const isClientLogin = pathname === "/login" || pathname === "/signup";
  const isAdminLogin  = pathname === "/admin";

  // Already signed in — bounce off the login pages to the correct dashboard.
  if (session && (isClientLogin || isAdminLogin)) {
    return NextResponse.redirect(new URL(dashboardFor(session.role), req.url));
  }

  // Portal: client (or admin previewing) only.
  if (isPortal) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.role !== "client" && session.role !== "admin") {
      // Team members belong in the internal panel, leads have no dashboard yet.
      return NextResponse.redirect(
        new URL(session.role === "team" ? "/internal" : "/", req.url),
      );
    }
  }

  // Internal panel: admin or team only.
  if (isInternal) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (session.role !== "admin" && session.role !== "team") {
      // Clients and leads have no business here.
      return NextResponse.redirect(new URL("/portal", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/internal/:path*", "/login", "/signup", "/admin"],
};

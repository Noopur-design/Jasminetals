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

  // The old /admin login door is gone — there's a single sign-in at /login now.
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const isPortal   = pathname.startsWith("/portal");
  const isInternal = pathname.startsWith("/internal");
  const isLogin = pathname === "/login" || pathname === "/signup";

  // Already signed in → bounce off the login page straight to the dashboard.
  if (session && isLogin) {
    return NextResponse.redirect(new URL(dashboardFor(session.role), req.url));
  }

  // Portal (the user dashboard): any signed-in user.
  if (isPortal && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Internal panel: owner-admin (or team) only.
  if (isInternal) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.role !== "admin" && session.role !== "team") {
      // Regular users belong in their portal, not the studio panel.
      return NextResponse.redirect(new URL("/portal", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*", "/internal/:path*", "/login", "/signup", "/admin"],
};

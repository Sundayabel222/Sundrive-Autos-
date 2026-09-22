import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

/**
 * Next 16 renamed `middleware` to `proxy`, and it runs on the Node.js runtime.
 *
 * This is a coarse gate for page navigations only. Server Functions are POSTs to
 * the same route, so every admin action re-checks the session via
 * `requireAdmin()` — see src/actions/*.ts.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/admin/login") {
    // Already signed in? Skip the login screen.
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Static by requirement — Next analyses this at build time.
  matcher: ["/admin/:path*"],
};

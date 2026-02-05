import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/student/:path*", "/tutor/:path*", "/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  // Supabase auth-helpers stores session in a cookie named sb-<project-ref>-auth-token
  const hasAuthCookie = req.cookies.getAll().some(
    (cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")
  );

  if (!hasAuthCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectedFrom", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

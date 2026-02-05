import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/student/:path*", "/tutor/:path*", "/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("sb-access-token");
  const refreshToken = req.cookies.get("sb-refresh-token");

  if (!accessToken && !refreshToken) {
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

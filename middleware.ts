import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*", "/student/:path*", "/tutor/:path*"],
};

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("sb-access-token");
  const refreshToken = req.cookies.get("sb-refresh-token");

  if (!accessToken && !refreshToken) {
    const loginUrl = new URL("/(auth)/login", req.url);
    loginUrl.searchParams.set("redirectedFrom", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

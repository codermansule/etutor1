import { NextRequest, NextResponse } from "next/server";
import { apiRateLimit, authRateLimit, aiRateLimit } from "@/lib/security/rate-limit";
import { applySecurityHeaders } from "@/lib/security/headers";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json|icons/).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const response = NextResponse.next();

  // Apply security headers to all responses
  applySecurityHeaders(response.headers);

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    let rateLimitResult;
    if (pathname.startsWith("/api/auth/")) {
      rateLimitResult = authRateLimit(ip);
    } else if (pathname.startsWith("/api/ai/")) {
      rateLimitResult = aiRateLimit(ip);
    } else {
      rateLimitResult = apiRateLimit(ip);
    }

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    response.headers.set(
      "X-RateLimit-Remaining",
      String(rateLimitResult.remaining)
    );
  }

  // Auth protection for dashboard routes
  const protectedPaths = [
    "/dashboard",
    "/student",
    "/tutor",
    "/admin",
    "/classroom",
  ];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const hasAuthCookie = req.cookies
      .getAll()
      .some(
        (cookie) =>
          cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")
      );

    if (!hasAuthCookie) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirectedFrom", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Set x-url header for server components
  response.headers.set("x-url", req.url);

  return response;
}

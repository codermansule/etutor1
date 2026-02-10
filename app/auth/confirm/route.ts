import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") ?? "signup";

  if (token_hash) {
    const supabase = await createServerClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "email",
    });

    if (!error) {
      // Get the user to determine role-based redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role ?? "student";
        const dashboardPath =
          role === "admin" ? "/admin" : role === "tutor" ? "/tutor" : "/student";

        return NextResponse.redirect(new URL(dashboardPath, request.url));
      }
    }
  }

  // Fallback: redirect to login with error
  return NextResponse.redirect(
    new URL("/login?error=confirmation_failed", request.url)
  );
}

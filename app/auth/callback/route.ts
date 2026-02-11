import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const error = requestUrl.searchParams.get("error");
    const errorDescription = requestUrl.searchParams.get("error_description");

    // Handle OAuth errors from provider
    if (error) {
        const errorUrl = new URL("/login", request.url);
        errorUrl.searchParams.set("error", "oauth_failed");
        errorUrl.searchParams.set("message", encodeURIComponent(errorDescription || error));
        return NextResponse.redirect(errorUrl);
    }

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    try {
        const supabase = await createServerClient();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error("Code exchange error:", exchangeError);
            const errorUrl = new URL("/login", request.url);
            errorUrl.searchParams.set("error", "oauth_failed");
            errorUrl.searchParams.set("message", encodeURIComponent("Failed to complete authentication. Please try again."));
            return NextResponse.redirect(errorUrl);
        }

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.redirect(new URL("/login?error=no_user", request.url));
        }

        if (!user.email) {
            return NextResponse.redirect(new URL("/login?error=no_email", request.url));
        }

        // Check if profile exists
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile) {
            // First-time OAuth user - create profile
            const fullName = user.user_metadata?.full_name 
                ?? user.user_metadata?.name 
                ?? user.email;
                
            const avatarUrl = user.user_metadata?.avatar_url 
                ?? user.user_metadata?.picture 
                ?? null;

            await supabase.from("profiles").upsert(
                {
                    id: user.id,
                    email: user.email,
                    full_name: fullName,
                    role: "student",
                    timezone: "UTC",
                    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
                },
                { ignoreDuplicates: true }
            );

            return NextResponse.redirect(new URL("/student", request.url));
        }

        // Role-based redirect
        const dashboardPath =
            profile.role === "admin"
                ? "/admin"
                : profile.role === "tutor"
                  ? "/tutor"
                  : "/student";

        return NextResponse.redirect(new URL(dashboardPath, request.url));

    } catch (err) {
        console.error("Callback error:", err);
        return NextResponse.redirect(new URL("/login?error=server_error", request.url));
    }
}

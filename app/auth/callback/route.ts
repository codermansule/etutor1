import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const supabase = await createServerClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                // Check if profile exists
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (!profile) {
                    // First-time OAuth user - create profile
                    const fullName =
                        user.user_metadata?.full_name ??
                        user.user_metadata?.name ??
                        user.email ??
                        "";
                    const avatarUrl =
                        user.user_metadata?.avatar_url ??
                        user.user_metadata?.picture ??
                        null;

                    await supabase.from("profiles").upsert(
                        {
                            id: user.id,
                            email: user.email ?? "",
                            full_name: fullName,
                            role: "student",
                            timezone: "UTC",
                            ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
                        },
                        { ignoreDuplicates: true }
                    );

                    return NextResponse.redirect(
                        new URL("/student", request.url)
                    );
                }

                // Role-based redirect
                const role = profile.role ?? "student";
                const dashboardPath =
                    role === "admin"
                        ? "/admin"
                        : role === "tutor"
                          ? "/tutor"
                          : "/student";

                return NextResponse.redirect(
                    new URL(dashboardPath, request.url)
                );
            }
        }
    }

    // Fallback
    return NextResponse.redirect(new URL("/login", request.url));
}

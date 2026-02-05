import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Super Admin check
    if (user.email === "admin@etutor.studybitests.com") {
        redirect("/admin");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role === "admin") {
        redirect("/admin");
    } else if (profile?.role === "tutor") {
        redirect("/tutor");
    } else {
        redirect("/student");
    }
}

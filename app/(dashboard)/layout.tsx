import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import DashboardTopbar from "@/components/layout/DashboardTopbar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, onboarding_completed")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as "student" | "tutor" | "admin") ?? "student";
  const userName = profile?.full_name ?? user.email ?? "User";

  const headersList = await headers();
  const fullUrl = headersList.get("x-url") || "";
  const pathname = fullUrl ? new URL(fullUrl).pathname : "";

  // Redirect tutor to onboarding if not completed, unless already on the onboarding page
  if (
    role === "tutor" &&
    !profile?.onboarding_completed &&
    !pathname.includes("/tutor/onboarding")
  ) {
    redirect("/tutor/onboarding");
  }

  // Phase 4: Trigger Gamification/Streak updates on layout load
  // We can do this on every day's first visit
  try {
    const { updateStreak, awardXP } = await import("@/lib/gamification/engine");
    const streakResult = await updateStreak(user.id);
    if (streakResult.success && !streakResult.alreadyUpdatedToday) {
      await awardXP(user.id, 'daily_login');
    }
  } catch (error) {
    console.error("Failed to update streak:", error);
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar userName={userName} role={role} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

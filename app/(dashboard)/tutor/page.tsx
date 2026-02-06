import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  BarChart3,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Tutor Dashboard | SBETUTOR",
};

const quickActions = [
  {
    href: "/tutor/bookings",
    icon: Calendar,
    label: "Bookings",
    description: "View and manage upcoming lessons",
  },
  {
    href: "/tutor/availability",
    icon: Clock,
    label: "Availability",
    description: "Set your weekly schedule",
  },
  {
    href: "/tutor/students",
    icon: Users,
    label: "Students",
    description: "See your student roster",
  },
  {
    href: "/tutor/courses",
    icon: BookOpen,
    label: "Courses",
    description: "Create and manage course content",
  },
];

export default async function TutorDashboard() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? "";

  // Start of this week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  // Start of this month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [profileRes, upcomingRes, studentsRes, reviewsRes, earningsRes] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single(),
      // Upcoming lessons this week
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("tutor_id", userId)
        .in("status", ["confirmed", "pending"])
        .gte("scheduled_at", weekStart.toISOString()),
      // Unique students
      supabase
        .from("bookings")
        .select("student_id")
        .eq("tutor_id", userId)
        .in("status", ["confirmed", "completed", "in_progress"]),
      // Average rating
      supabase
        .from("reviews")
        .select("rating")
        .eq("tutor_id", userId),
      // Monthly earnings
      supabase
        .from("payments")
        .select("tutor_amount")
        .eq("tutor_id", userId)
        .eq("status", "completed")
        .gte("created_at", monthStart.toISOString()),
    ]);

  const profile = profileRes.data;
  const firstName = profile?.full_name?.split(" ")[0] ?? "Tutor";
  const upcomingCount = upcomingRes.count ?? 0;

  // Count unique students
  const uniqueStudents = new Set(
    (studentsRes.data ?? []).map((b) => b.student_id)
  ).size;

  // Average rating
  const ratings = (reviewsRes.data ?? []).map((r) => r.rating);
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : null;

  // Monthly earnings
  const monthlyEarnings = (earningsRes.data ?? []).reduce(
    (sum, p) => sum + Number(p.tutor_amount ?? 0),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Here&apos;s an overview of your tutoring activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="h-4 w-4 text-sky-400" />
            <span className="text-xs uppercase tracking-[0.2em]">
              Upcoming
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">
            {upcomingCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {upcomingCount === 1 ? "lesson" : "lessons"} this week
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-[0.2em]">
              Students
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">
            {uniqueStudents}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {uniqueStudents === 1 ? "student" : "total students"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <BarChart3 className="h-4 w-4 text-amber-400" />
            <span className="text-xs uppercase tracking-[0.2em]">Rating</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">
            {avgRating ?? "--"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {ratings.length > 0
              ? `${ratings.length} review${ratings.length === 1 ? "" : "s"}`
              : "no reviews yet"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-xs uppercase tracking-[0.2em]">
              Earnings
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">
            ${monthlyEarnings.toFixed(0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">this month</p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Quick actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-sky-400/30 hover:bg-white/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 transition group-hover:bg-sky-500/20">
                <action.icon className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

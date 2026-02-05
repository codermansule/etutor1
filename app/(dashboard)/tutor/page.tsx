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
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id ?? "")
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "Tutor";

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
          <p className="mt-2 text-3xl font-semibold text-white">0</p>
          <p className="mt-1 text-xs text-slate-500">lessons this week</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="h-4 w-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-[0.2em]">
              Students
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">0</p>
          <p className="mt-1 text-xs text-slate-500">total students</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <BarChart3 className="h-4 w-4 text-amber-400" />
            <span className="text-xs uppercase tracking-[0.2em]">Rating</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">--</p>
          <p className="mt-1 text-xs text-slate-500">no reviews yet</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-xs uppercase tracking-[0.2em]">
              Earnings
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">$0</p>
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

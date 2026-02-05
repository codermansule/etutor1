import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import {
  Search,
  Calendar,
  BrainCircuit,
  Trophy,
  Flame,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Student Dashboard | SBETUTOR",
};

const quickActions = [
  {
    href: "/student/find-tutors",
    icon: Search,
    label: "Find a tutor",
    description: "Browse expert tutors by subject",
  },
  {
    href: "/student/my-lessons",
    icon: Calendar,
    label: "My lessons",
    description: "View upcoming and past sessions",
  },
  {
    href: "/student/ai-tutor",
    icon: BrainCircuit,
    label: "AI tutor",
    description: "Practice with adaptive AI coaching",
  },
  {
    href: "/student/achievements",
    icon: Trophy,
    label: "Achievements",
    description: "Badges, streaks, and leaderboard",
  },
];

export default async function StudentDashboard() {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id ?? "")
    .single();

  const firstName = profile?.full_name?.split(" ")[0] ?? "Student";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Pick up where you left off or explore something new.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-xs uppercase tracking-[0.2em]">Streak</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">0 days</p>
          <p className="mt-1 text-xs text-slate-500">
            Complete a lesson or quiz to start
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Star className="h-4 w-4 text-sky-400" />
            <span className="text-xs uppercase tracking-[0.2em]">XP</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">0</p>
          <p className="mt-1 text-xs text-slate-500">Level 1 — Beginner</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-[0.2em]">
              Lessons
            </span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-white">0</p>
          <p className="mt-1 text-xs text-slate-500">No upcoming lessons</p>
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

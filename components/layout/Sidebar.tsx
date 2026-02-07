"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Calendar,
  BrainCircuit,
  Trophy,
  Gift,
  MessageSquare,
  Settings,
  BarChart3,
  Users,
  BookOpen,
  Clock,
  DollarSign,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const studentNav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: Home },
  { href: "/tutors", label: "Find Tutors", icon: Search },
  { href: "/student/my-lessons", label: "My Lessons", icon: Calendar },
  { href: "/student/courses", label: "Courses", icon: BookOpen },
  { href: "/student/ai-tutor", label: "AI Tutor", icon: BrainCircuit },
  { href: "/student/achievements", label: "Achievements", icon: Trophy },
  { href: "/student/rewards", label: "Rewards", icon: Gift },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/student/settings", label: "Settings", icon: Settings },
];

const tutorNav: NavItem[] = [
  { href: "/tutor", label: "Dashboard", icon: Home },
  { href: "/tutor/bookings", label: "Bookings", icon: Calendar },
  { href: "/tutor/availability", label: "Availability", icon: Clock },
  { href: "/tutor/students", label: "Students", icon: Users },
  { href: "/tutor/courses", label: "Courses", icon: BookOpen },
  { href: "/tutor/achievements", label: "Achievements", icon: Trophy },
  { href: "/tutor/earnings", label: "Earnings", icon: DollarSign },
  { href: "/tutor/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/tutor/messages", label: "Messages", icon: MessageSquare },
  { href: "/tutor/settings", label: "Settings", icon: Settings },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "System Overview", icon: Home },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/tutors", label: "Tutor Approval", icon: Users },
  { href: "/admin/subjects", label: "Subjects & Skills", icon: BookOpen },
  { href: "/admin/ingestion", label: "AI Knowledge", icon: BrainCircuit },
  { href: "/admin/analytics", label: "Global Analytics", icon: BarChart3 },
  { href: "/admin/moderation", label: "Moderation", icon: Shield },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
];

import Logo from "../shared/Logo";

export default function Sidebar({ role }: { role: "student" | "tutor" | "admin" }) {
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : role === "tutor" ? tutorNav : studentNav;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950 lg:block">
      <div className="h-full flex flex-col">
        <div className="border-b border-white/10 p-6">
          <Logo className="-ml-1" />
          <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">
            {role} portal
          </p>
        </div>
        <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${role}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-sky-500/10 text-sky-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

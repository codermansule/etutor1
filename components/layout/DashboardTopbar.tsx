"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, LogOut } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function DashboardTopbar({
  userName,
  role,
}: {
  userName: string;
  role: "student" | "tutor";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const breadcrumb = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "));

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <nav className="hidden text-sm text-slate-400 sm:block">
            {breadcrumb.map((seg, i) => (
              <span key={seg}>
                {i > 0 && <span className="mx-1.5 text-slate-600">/</span>}
                <span
                  className={cn(
                    i === breadcrumb.length - 1
                      ? "text-white"
                      : "text-slate-400"
                  )}
                >
                  {seg}
                </span>
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <span className="hidden text-slate-300 sm:inline">
              {userName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-red-400"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 bg-slate-950 p-4 lg:hidden">
          <Link
            href={`/${role}`}
            className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href={`/${role}/settings`}
            className="block rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5"
            onClick={() => setMobileOpen(false)}
          >
            Settings
          </Link>
        </nav>
      )}
    </header>
  );
}

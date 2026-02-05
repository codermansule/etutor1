"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, LogOut, Check, Sparkles, MessageCircle, Calendar as CalendarIcon, Trophy } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function DashboardTopbar({
  userName,
  role,
}: {
  userName: string;
  role: "student" | "tutor" | "admin";
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const pathname = usePathname();
  const supabase = createBrowserClient();

  // Fetch and subscribe to notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setNotifications(data);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const breadcrumb = pathname
    .split("/")
    .filter(Boolean)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "));

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'badge_earned': return <Trophy className="h-4 w-4 text-amber-400" />;
      case 'xp_milestone': return <Sparkles className="h-4 w-4 text-sky-400" />;
      case 'message': return <MessageCircle className="h-4 w-4 text-indigo-400" />;
      case 'lesson_reminder': return <CalendarIcon className="h-4 w-4 text-rose-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden transition"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            {breadcrumb.map((seg, i) => (
              <div key={seg} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-slate-700">/</span>}
                <span className={cn(
                  "px-2 py-1 rounded-md transition",
                  i === breadcrumb.length - 1 ? "text-white bg-white/5" : "text-slate-500"
                )}>
                  {seg}
                </span>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={cn(
                "relative rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition group",
                notificationsOpen && "bg-white/5 text-white"
              )}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-500 ring-4 ring-slate-950 px-0 transition group-hover:scale-125" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notifications</span>
                  {unreadCount > 0 && <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full font-bold">{unreadCount} New</span>}
                </div>
                <div className="max-h-[350px] overflow-y-auto space-y-1 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                      <p className="text-xs">All caught up!</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={cn(
                          "group flex gap-3 rounded-xl p-3 transition hover:bg-white/5 cursor-pointer relative",
                          !n.is_read && "bg-sky-500/5"
                        )}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className="shrink-0 mt-0.5">
                          <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center">
                            {getNotificationIcon(n.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white mb-0.5">{n.title}</p>
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-600 mt-1.5">{formatDistanceToNow(new Date(n.created_at))} ago</p>
                        </div>
                        {!n.is_read && (
                          <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-sky-500" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-[1px] bg-white/10 mx-1" />

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{role}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 p-0.5 ring-2 ring-transparent transition hover:ring-sky-500/50">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 text-xs font-black text-sky-400">
                {userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-white/5 hover:text-rose-400 transition"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-white/10 bg-slate-950 p-4 lg:hidden animate-in slide-in-from-top-2">
          <Link
            href={`/${role}`}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition"
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href={`/${role}/settings`}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition"
            onClick={() => setMobileOpen(false)}
          >
            Settings
          </Link>
        </nav>
      )}
    </header>
  );
}

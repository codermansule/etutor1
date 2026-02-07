import { createServerClient } from "@/lib/supabase/server";
import { Activity, Calendar, Clock, DollarSign } from "lucide-react";
import type { Metadata } from "next";

async function getBookingsByTimeWindow(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  userId: string,
  startIso: string,
  endIso?: string,
  statusFilter: string[] = ["confirmed", "pending", "in_progress"],
) {
  let query = supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tutor_id", userId)
    .in("status", statusFilter)
    .gte("scheduled_at", startIso);

  if (endIso) {
    query = query.lt("scheduled_at", endIso);
  }

  return query;
}

export const metadata: Metadata = {
  title: "Tutor Analytics | ETUTOR",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default async function TutorAnalyticsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? "";
  const now = new Date();
  const weekDay = now.getDay();
  const weekStart = new Date(now);
  const mondayOffset = weekDay === 0 ? -6 : 1 - weekDay;
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

  const [weekCountRes, monthCountRes, completedMonthRes, revenueMonthRes, revenueLastMonthRes, reviewsRes, upcomingRes] =
    await Promise.all([
      getBookingsByTimeWindow(supabase, userId, weekStart.toISOString()),
      getBookingsByTimeWindow(supabase, userId, monthStart.toISOString()),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("tutor_id", userId)
        .eq("status", "completed")
        .gte("scheduled_at", monthStart.toISOString()),
      supabase
        .from("payments")
        .select("tutor_amount")
        .eq("tutor_id", userId)
        .eq("status", "completed")
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("payments")
        .select("tutor_amount")
        .eq("tutor_id", userId)
        .eq("status", "completed")
        .gte("created_at", prevMonthStart.toISOString())
        .lt("created_at", monthStart.toISOString()),
      supabase.from("reviews").select("rating").eq("tutor_id", userId),
      supabase
        .from("bookings")
        .select("id, scheduled_at, status, price, student_id")
        .eq("tutor_id", userId)
        .in("status", ["confirmed", "pending"])
        .gte("scheduled_at", weekStart.toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(6),
    ]);

  const upcomingBookings = upcomingRes.data ?? [];
  const studentIds = [
    ...new Set(upcomingBookings.map((booking) => booking.student_id)),
  ].filter((id): id is string => Boolean(id));

  const studentNames: Record<string, string> = {};
  if (studentIds.length > 0) {
    const studentRes = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", studentIds);

    (studentRes.data ?? []).forEach((profile) => {
      if (profile?.id && profile.full_name) {
        studentNames[profile.id] = profile.full_name;
      }
    });
  }

  const sumAmount = (rows: Array<{ tutor_amount?: string | number } | null | undefined>) =>
    (rows ?? []).reduce((sum, row) => sum + Number(row?.tutor_amount ?? 0), 0);

  const metrics = [
    {
      title: "Lessons this week",
      value: weekCountRes.count ?? 0,
      subtitle: "Scheduled this week",
      icon: Calendar,
    },
    {
      title: "Lessons this month",
      value: monthCountRes.count ?? 0,
      subtitle: "Scheduled this month",
      icon: Activity,
    },
    {
      title: "Completed lessons",
      value: completedMonthRes.count ?? 0,
      subtitle: "This month",
      icon: Clock,
    },
    {
      title: "Revenue this month",
      value: `$${sumAmount(revenueMonthRes.data).toFixed(0)}`,
      subtitle: `Last month: $${sumAmount(revenueLastMonthRes.data).toFixed(0)}`,
      icon: DollarSign,
    },
  ];

  const ratings = (reviewsRes.data ?? []).map((review) => review?.rating ?? 0);
  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((acc, rating) => acc + rating, 0) / ratings.length).toFixed(1)
      : "--";

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-white">Tutor Analytics</h1>
        <p className="text-sm text-slate-400">Monitor lessons, revenue, and student feedback.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-slate-400">
              <metric.icon className="h-4 w-4 text-sky-400" />
              <span className="text-xs uppercase tracking-[0.2em]">{metric.subtitle}</span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-white">{metric.value}</p>
            <p className="text-xs text-slate-500">{metric.title}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Upcoming lessons</p>
            <span className="text-xs text-slate-500">{upcomingBookings.length} bookings</span>
          </div>
          <div className="divide-y divide-white/5">
            {upcomingBookings.length === 0 && (
              <p className="text-xs text-slate-500 py-6">No confirmed or pending lessons scheduled for this week.</p>
            )}
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {studentNames[booking.student_id] ?? "Student"}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(booking.scheduled_at)}</p>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Ratings</p>
          <div className="text-4xl font-black text-white">{averageRating}</div>
          <p className="text-xs text-slate-500">
            Based on {ratings.length} review{ratings.length === 1 ? "" : "s"}.
          </p>
        </div>
      </div>
    </div>
  );
}

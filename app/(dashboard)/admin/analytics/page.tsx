import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { BarChart3, Users, DollarSign, TrendingUp, Zap, Award } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const supabase = await createServerClient();

  const [
    totalUsersRes,
    studentsRes,
    tutorsRes,
    bookingsRes,
    revenueRes,
    sessionsRes,
    xpRes,
    badgesRes,
    recentPaymentsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount, created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(100),
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('user_xp').select('total_xp'),
    supabase.from('user_badges').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount, created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(30),
  ]);

  const payments = revenueRes.data ?? [];
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const avgXp = (xpRes.data ?? []).length > 0
    ? Math.round((xpRes.data ?? []).reduce((s, x) => s + (x.total_xp || 0), 0) / (xpRes.data ?? []).length)
    : 0;

  // Revenue by day (last 30 days)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const revenueByDay = new Map<string, number>();
  for (const p of (recentPaymentsRes.data ?? [])) {
    const day = p.created_at?.split('T')[0];
    if (day) revenueByDay.set(day, (revenueByDay.get(day) || 0) + (p.amount || 0));
  }

  const maxDayRevenue = Math.max(...last30Days.map(d => revenueByDay.get(d) || 0), 1);

  const metrics = [
    { label: 'Total Users', value: totalUsersRes.count || 0, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'Students', value: studentsRes.count || 0, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Tutors', value: tutorsRes.count || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Bookings', value: bookingsRes.count || 0, icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Total Sessions', value: sessionsRes.count || 0, icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Avg User XP', value: avgXp.toLocaleString(), icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Badges Earned', value: badgesRes.count || 0, icon: Award, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Platform Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">Revenue, user growth, and engagement metrics.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {metrics.map((m, i) => (
          <Card key={i} className="bg-slate-900/50 border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={m.bg + " p-1.5 rounded-lg"}>
                <m.icon className={"h-3.5 w-3.5 " + m.color} />
              </div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{m.label}</span>
            </div>
            <p className="text-lg font-black text-white">{m.value}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-amber-400" />
          Revenue (Last 30 Days)
        </h3>
        <div className="flex items-end gap-1 h-40">
          {last30Days.map((day) => {
            const amount = revenueByDay.get(day) || 0;
            const height = maxDayRevenue > 0 ? Math.max((amount / maxDayRevenue) * 100, 2) : 2;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                  {day}: ${amount}
                </div>
                <div
                  className={`w-full rounded-t ${amount > 0 ? 'bg-amber-500/60 hover:bg-amber-500' : 'bg-white/5'} transition`}
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-slate-600">
          <span>{last30Days[0]}</span>
          <span>{last30Days[last30Days.length - 1]}</span>
        </div>
      </Card>
    </div>
  );
}

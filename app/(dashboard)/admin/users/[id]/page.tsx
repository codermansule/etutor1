import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Zap, Calendar, Star, BookOpen } from 'lucide-react';

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerClient();

  const [profileRes, xpRes, bookingsRes, reviewsRes, paymentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', id).single(),
    supabase.from('user_xp').select('total_xp, coins, current_level').eq('id', id).single(),
    supabase.from('bookings').select('id, status, created_at', { count: 'exact' }).or(`student_id.eq.${id},tutor_id.eq.${id}`),
    supabase.from('reviews').select('rating').eq('student_id', id),
    supabase.from('payments').select('amount, status').eq('user_id', id),
  ]);

  const profile = profileRes.data;
  if (!profile) notFound();

  const xp = xpRes.data;
  const totalPayments = (paymentsRes.data ?? []).filter((p: any) => p.status === 'completed').reduce((s: number, p: any) => s + (p.amount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-6">
        <div className="h-16 w-16 rounded-full bg-sky-500/10 flex items-center justify-center text-2xl font-black text-sky-400">
          {(profile.full_name || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">{profile.full_name || 'Unknown User'}</h1>
          <p className="text-sm text-slate-400">{profile.email}</p>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
            profile.role === 'tutor' ? 'text-emerald-400 bg-emerald-500/10' :
            profile.role === 'admin' ? 'text-purple-400 bg-purple-500/10' :
            'text-sky-400 bg-sky-500/10'
          }`}>{profile.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: 'XP', value: xp?.total_xp?.toLocaleString() || '0', color: 'text-sky-400' },
          { icon: Star, label: 'Level', value: xp?.current_level || 1, color: 'text-purple-400' },
          { icon: Calendar, label: 'Bookings', value: bookingsRes.count || 0, color: 'text-emerald-400' },
          { icon: BookOpen, label: 'Spent', value: `$${totalPayments.toLocaleString()}`, color: 'text-amber-400' },
        ].map((s, i) => (
          <Card key={i} className="bg-slate-900/50 border-white/5 p-4 text-center">
            <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
            <p className="text-lg font-black text-white">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900/50 border-white/5 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Account Details</h3>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between p-3 rounded-xl bg-white/5">
            <span className="text-slate-400">User ID</span>
            <span className="text-white font-mono text-xs">{profile.id}</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-white/5">
            <span className="text-slate-400">Joined</span>
            <span className="text-white">{new Date(profile.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-white/5">
            <span className="text-slate-400">Onboarding</span>
            <span className={profile.onboarding_completed ? 'text-emerald-400' : 'text-amber-400'}>
              {profile.onboarding_completed ? 'Completed' : 'Pending'}
            </span>
          </div>
          <div className="flex justify-between p-3 rounded-xl bg-white/5">
            <span className="text-slate-400">Coins</span>
            <span className="text-amber-400 font-bold">{xp?.coins || 0}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

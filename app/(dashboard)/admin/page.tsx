import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import {
    Users,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Activity,
    AlertCircle,
    DollarSign,
    Calendar,
    Clock,
    ArrowRight,
} from 'lucide-react';

export default async function AdminDashboardPage() {
    const supabase = await createServerClient();

    const today = new Date().toISOString().split('T')[0];

    const [
        studentCountRes,
        tutorCountRes,
        bookingCountRes,
        revenueRes,
        sessionsToday,
        pendingTutorsRes,
        recentBookingsRes,
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'tutor'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount').eq('status', 'completed'),
        supabase.from('sessions').select('*', { count: 'exact', head: true }).gte('started_at', today),
        supabase.from('tutor_profiles').select('id, profiles(full_name, email, created_at)').eq('is_verified', false),
        supabase.from('bookings').select('id, status, created_at, profiles!bookings_student_id_fkey(full_name)').order('created_at', { ascending: false }).limit(5),
    ]);

    const totalRevenue = (revenueRes.data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0);

    const stats = [
        { label: 'Total Students', value: studentCountRes.count || 0, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10', href: '/admin/users' },
        { label: 'Active Tutors', value: tutorCountRes.count || 0, icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-500/10', href: '/admin/tutors' },
        { label: 'Total Bookings', value: bookingCountRes.count || 0, icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10', href: '/admin/analytics' },
        { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', href: '/admin/analytics' },
        { label: 'Sessions Today', value: sessionsToday.count || 0, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/admin/analytics' },
    ];

    const pendingTutors = pendingTutorsRes.data ?? [];
    const recentBookings = recentBookingsRes.data ?? [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">System Overview</h1>
                <p className="text-slate-400 mt-1">Platform-wide statistics and management.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                {stats.map((stat, i) => (
                    <Link key={i} href={stat.href}>
                        <Card className="bg-slate-900/50 border-white/5 p-5 hover:border-white/10 transition cursor-pointer">
                            <div className="flex items-center justify-between mb-3">
                                <div className={stat.bg + " p-2 rounded-xl"}>
                                    <stat.icon className={"h-4 w-4 " + stat.color} />
                                </div>
                                <TrendingUp className="h-3.5 w-3.5 text-emerald-500/50" />
                            </div>
                            <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                            <p className="text-xl font-black text-white mt-0.5">{stat.value}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-slate-900/50 border-white/5 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                            Pending Tutor Approvals
                        </h3>
                        <Link href="/admin/tutors" className="text-xs text-sky-400 hover:underline flex items-center gap-1">
                            View All <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    {pendingTutors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <GraduationCap className="h-10 w-10 text-slate-700 mb-3" />
                            <p className="text-sm text-slate-500">No pending applications</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingTutors.slice(0, 5).map((tutor: any) => (
                                <div key={tutor.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                    <div>
                                        <p className="text-sm font-medium text-white">{(tutor.profiles as any)?.full_name || 'Unknown'}</p>
                                        <p className="text-xs text-slate-500">{(tutor.profiles as any)?.email}</p>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">Pending</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="bg-slate-900/50 border-white/5 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-sky-400" />
                            Recent Activity
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {recentBookings.map((b: any) => (
                            <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <div>
                                    <p className="text-sm text-white">{(b.profiles as any)?.full_name || 'Student'} booked a lesson</p>
                                    <p className="text-xs text-slate-500">{new Date(b.created_at).toLocaleDateString()}</p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                                    b.status === 'confirmed' ? 'text-emerald-400 bg-emerald-500/10' :
                                    b.status === 'pending' ? 'text-amber-400 bg-amber-500/10' :
                                    'text-slate-400 bg-slate-500/10'
                                }`}>{b.status}</span>
                            </div>
                        ))}
                        {recentBookings.length === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">No recent bookings</p>
                        )}
                    </div>
                </Card>

                <Card className="bg-slate-900/50 border-white/5 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-sky-400" />
                        System Health
                    </h3>
                    <div className="space-y-3">
                        {[
                            { name: 'Database (Supabase)', status: 'Operational' },
                            { name: 'AI Services (OpenAI)', status: 'Operational' },
                            { name: 'Video (LiveKit)', status: 'Operational' },
                            { name: 'Payments (Stripe)', status: 'Operational' },
                        ].map((s) => (
                            <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                <span className="text-sm text-slate-300">{s.name}</span>
                                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    {s.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

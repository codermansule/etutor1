import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import {
    Users,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Activity,
    AlertCircle
} from 'lucide-react';

export default async function AdminDashboardPage() {
    const supabase = createServerClient();

    // Fetch some basic stats
    const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

    const { count: tutorCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'tutor');

    const { count: subjectCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });

    const stats = [
        { label: 'Total Students', value: studentCount || 0, icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        { label: 'Active Tutors', value: tutorCount || 0, icon: GraduationCap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Subjects', value: subjectCount || 0, icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Sessions Today', value: 0, icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">System Overview</h1>
                <p className="text-slate-400 mt-1">Platform-wide statistics and management.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-slate-900/50 border-white/5 p-6 hover:border-white/10 transition">
                        <div className="flex items-center justify-between mb-4">
                            <div className={stat.bg + " p-2.5 rounded-xl"}>
                                <stat.icon className={"h-5 w-5 " + stat.color} />
                            </div>
                            <TrendingUp className="h-4 w-4 text-emerald-500/50" />
                        </div>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="text-2xl font-black text-white mt-1">{stat.value}</p>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-slate-900/50 border-white/5 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-sky-400" />
                        System Health
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-sm text-slate-300">Database (Supabase)</span>
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Operational
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-sm text-slate-300">AI Services (OpenAI)</span>
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Operational
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                            <span className="text-sm text-slate-300">Video (LiveKit)</span>
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Operational
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="bg-slate-900/50 border-white/5 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-400" />
                        Pending Approvals
                    </h3>
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <GraduationCap className="h-10 w-10 text-slate-700 mb-3" />
                        <p className="text-sm text-slate-500">No new tutor applications to review</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

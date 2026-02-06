import BadgeList from "@/components/features/gamification/BadgeList";
import Leaderboard from "@/components/features/gamification/Leaderboard";
import { Award, Zap, Target, Flame, Brain, Rocket, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { createServerClient } from "@/lib/supabase/server";

export default async function TutorAchievementsPage() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? '';

    const [xpRes, streakRes, allBadgesRes, earnedBadgesRes, leaderboardRes, sessionsRes, reviewsRes] = await Promise.all([
        supabase.from('user_xp').select('total_xp, coins, current_level').eq('id', userId).single(),
        supabase.from('user_streaks').select('current_streak, longest_streak').eq('id', userId).single(),
        supabase.from('badges').select('id, name, description, icon, rarity').order('rarity'),
        supabase.from('user_badges').select('badge_id').eq('user_id', userId),
        supabase.from('user_xp').select('id, total_xp').order('total_xp', { ascending: false }).limit(10),
        supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('tutor_id', userId).eq('status', 'ended'),
        supabase.from('reviews').select('rating').eq('tutor_id', userId),
    ]);

    const xp = xpRes.data;
    const streak = streakRes.data;
    const allBadges = allBadgesRes.data ?? [];
    const earnedBadgeIds = new Set((earnedBadgesRes.data ?? []).map((b) => b.badge_id));

    const badges = allBadges.map((b) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        icon: b.icon,
        rarity: b.rarity,
        earned: earnedBadgeIds.has(b.id),
    }));

    const earnedCount = badges.filter((b) => b.earned).length;
    const totalCount = badges.length;
    const totalXp = xp?.total_xp ?? 0;
    const currentLevel = xp?.current_level ?? 1;
    const currentStreak = streak?.current_streak ?? 0;
    const lessonsDelivered = sessionsRes.count ?? 0;
    const reviewsList = reviewsRes.data ?? [];
    const avgRating = reviewsList.length > 0
        ? (reviewsList.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsList.length).toFixed(1)
        : 'N/A';

    const leaderboardXp = leaderboardRes.data ?? [];
    const profileIds = leaderboardXp.map((e) => e.id);
    const { data: profiles } = profileIds.length > 0
        ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', profileIds)
        : { data: [] };
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    let userRank = '-';
    const leaderboardEntries = leaderboardXp.map((entry, i) => {
        const profile = profileMap.get(entry.id);
        if (entry.id === userId) userRank = `#${i + 1}`;
        return {
            rank: i + 1,
            user: { full_name: profile?.full_name ?? 'Anonymous', avatar_url: profile?.avatar_url ?? '' },
            xp_earned: entry.total_xp ?? 0,
            trend: 'stable' as const,
        };
    });

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white">Tutor Achievements</h1>
                    <p className="text-sm text-slate-400 font-medium italic">Track your teaching milestones, earn badges, and grow as an educator.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="px-6 py-4 rounded-3xl bg-sky-500/10 border border-sky-500/20 backdrop-blur-xl flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-sky-500 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                            <Rocket className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Rank</p>
                            <p className="text-xl font-black text-white">{userRank}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                            { icon: Brain, label: "XP Points", value: totalXp.toLocaleString(), color: "text-sky-400" },
                            { icon: GraduationCap, label: "Lessons Taught", value: String(lessonsDelivered), color: "text-emerald-400" },
                            { icon: Zap, label: "Level", value: String(currentLevel), color: "text-purple-400" },
                            { icon: Target, label: "Avg Rating", value: String(avgRating), color: "text-amber-400" },
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col items-center text-center space-y-2">
                                <stat.icon className={cn("h-6 w-6 mb-2", stat.color)} />
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-white tracking-widest">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                                <Award className="h-5 w-5 text-sky-400" />
                                Badge Collection
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{earnedCount} / {totalCount} Unlocked</p>
                        </div>
                        <BadgeList badges={badges} />
                    </div>
                </div>

                <div className="space-y-12">
                    <Leaderboard entries={leaderboardEntries} />
                </div>
            </div>
        </div>
    );
}

import BadgeList from "@/components/features/gamification/BadgeList";
import Leaderboard from "@/components/features/gamification/Leaderboard";
import ChallengeList from "@/components/features/gamification/ChallengeList";
import { Award, Zap, Target, Flame, Brain, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { createServerClient } from "@/lib/supabase/server";

export default async function AchievementsPage() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? '';

    // Fetch all data in parallel
    const [xpRes, streakRes, allBadgesRes, earnedBadgesRes, leaderboardRes, userChallengesRes, allChallengesRes] = await Promise.all([
        supabase.from('user_xp').select('total_xp, coins, current_level').eq('id', userId).single(),
        supabase.from('user_streaks').select('current_streak, longest_streak').eq('id', userId).single(),
        supabase.from('badges').select('id, name, description, icon, rarity').order('rarity'),
        supabase.from('user_badges').select('badge_id').eq('user_id', userId),
        supabase.from('user_xp').select('id, total_xp').order('total_xp', { ascending: false }).limit(10),
        supabase
            .from('user_challenges')
            .select('challenge_id, current_value, completed, completed_at, challenges!inner(title, description, target_value, xp_reward, challenge_type, ends_at)')
            .eq('user_id', userId),
        supabase
            .from('challenges')
            .select('id, title, description, challenge_type, target_value, xp_reward, coin_reward, starts_at, ends_at, is_active')
            .eq('is_active', true)
            .gte('ends_at', new Date().toISOString())
            .order('ends_at'),
    ]);

    const xp = xpRes.data;
    const streak = streakRes.data;
    const allBadges = allBadgesRes.data ?? [];
    const earnedBadgeIds = new Set((earnedBadgesRes.data ?? []).map((b) => b.badge_id));

    // Build badges list with earned state
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

    // Build leaderboard from user_xp, resolve profiles
    const leaderboardXp = leaderboardRes.data ?? [];
    const profileIds = leaderboardXp.map((e) => e.id);

    const { data: profiles } = profileIds.length > 0
        ? await supabase.from('profiles').select('id, full_name, avatar_url').in('id', profileIds)
        : { data: [] };

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    // Find current user's rank
    let userRank = '-';
    const leaderboardEntries = leaderboardXp.map((entry, i) => {
        const profile = profileMap.get(entry.id);
        if (entry.id === userId) userRank = `#${i + 1}`;
        return {
            rank: i + 1,
            user: {
                full_name: profile?.full_name ?? 'Anonymous',
                avatar_url: profile?.avatar_url ?? '',
            },
            xp_earned: entry.total_xp ?? 0,
            trend: 'stable' as const,
        };
    });

    const totalXp = xp?.total_xp ?? 0;
    const currentLevel = xp?.current_level ?? 1;
    const currentStreak = streak?.current_streak ?? 0;

    // All challenges with user progress
    const userChallengeMap = new Map(
        (userChallengesRes.data ?? []).map((uc: any) => [uc.challenge_id, uc])
    );
    const allChallenges = (allChallengesRes.data ?? []).map((c: any) => {
        const uc = userChallengeMap.get(c.id);
        return {
            ...c,
            joined: !!uc,
            currentValue: uc?.current_value ?? 0,
            completed: uc?.completed ?? false,
            completedAt: uc?.completed_at,
        };
    });

    // First active (non-completed, joined) challenge for the featured card
    const activeChallenge = allChallenges.find((c) => c.joined && !c.completed);
    const challengeProgress = activeChallenge
        ? Math.min(Math.round((activeChallenge.currentValue / activeChallenge.target_value) * 100), 100)
        : 0;

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white">Achievements & Growth</h1>
                    <p className="text-sm text-slate-400 font-medium italic">Track your learning milestones, earn badges, and compete with the global community.</p>
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
                {/* Left Column: Stats & Badges */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Stats Highlights */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {[
                            { icon: Brain, label: "XP Points", value: totalXp.toLocaleString(), color: "text-sky-400" },
                            { icon: Flame, label: "Day Streak", value: String(currentStreak), color: "text-orange-400" },
                            { icon: Zap, label: "Level", value: String(currentLevel), color: "text-purple-400" },
                            { icon: Target, label: "Badges", value: `${earnedCount}/${totalCount}`, color: "text-emerald-400" },
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col items-center text-center space-y-2">
                                <stat.icon className={cn("h-6 w-6 mb-2", stat.color)} />
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-white tracking-widest">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Badge Collection */}
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

                {/* Right Column: Leaderboard & Challenges */}
                <div className="space-y-12">
                    <Leaderboard entries={leaderboardEntries} />

                    {/* Active Challenge Card */}
                    {activeChallenge && (
                        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

                            <div className="relative space-y-6">
                                <div className="flex items-center gap-3">
                                    <Zap className="h-5 w-5 text-indigo-400 animate-pulse" />
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Challenge</h3>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="text-lg font-black text-white uppercase tracking-tight">{activeChallenge.title}</h4>
                                    <p className="text-xs text-indigo-200/60 font-medium italic">{activeChallenge.description}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="h-2 w-full bg-slate-950/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all"
                                            style={{ width: `${challengeProgress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold text-indigo-300 uppercase italic">
                                        <span>{activeChallenge.currentValue}/{activeChallenge.target_value} {activeChallenge.challenge_type}</span>
                                        <span>Reward: {activeChallenge.xp_reward} XP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* All Challenges Section */}
            {allChallenges.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                            <Target className="h-5 w-5 text-indigo-400" />
                            Challenges
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
                            {allChallenges.filter(c => c.completed).length} / {allChallenges.length} Completed
                        </p>
                    </div>
                    <ChallengeList challenges={allChallenges} />
                </div>
            )}
        </div>
    );
}

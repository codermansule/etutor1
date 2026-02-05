import BadgeList from "@/components/features/gamification/BadgeList";
import Leaderboard from "@/components/features/gamification/Leaderboard";
import { Award, Zap, Target, Flame, Brain, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
    // Mock data for initial UI build
    const mockBadges = [
        { id: '1', name: 'First Step', description: 'Complete your first tutoring session.', icon: 'star', rarity: 'common', earned: true },
        { id: '2', name: 'Quick Learner', description: 'Complete 5 lessons.', icon: 'zap', rarity: 'common', earned: true },
        { id: '3', name: 'Social Butterfly', description: 'Write 5 tutor reviews.', icon: 'message-circle', rarity: 'common', earned: false },
        { id: '4', name: 'Week on Fire', description: 'Maintain a 7-day learning streak.', icon: 'flame', rarity: 'uncommon', earned: true },
        { id: '5', name: 'Dedicated Learner', description: 'Complete 25 lessons.', icon: 'award', rarity: 'uncommon', earned: false },
        { id: '6', name: 'Persistence Pays', description: 'Maintain a 30-day learning streak.', icon: 'ice-cube', rarity: 'rare', earned: false },
        { id: '7', name: 'Knowledge Master', description: 'Complete 100 lessons.', icon: 'crown', rarity: 'rare', earned: false },
        { id: '8', name: 'Zenith', description: 'Reach Level 10.', icon: 'gem', rarity: 'legendary', earned: false },
    ];

    const mockLeaderboard = [
        { rank: 1, user: { full_name: 'Sarah Connor', avatar_url: '' }, xp_earned: 12500, trend: 'stable' as const },
        { rank: 2, user: { full_name: 'John Wick', avatar_url: '' }, xp_earned: 11200, trend: 'up' as const },
        { rank: 3, user: { full_name: 'Ellen Ripley', avatar_url: '' }, xp_earned: 9800, trend: 'stable' as const },
        { rank: 4, user: { full_name: 'Rick Sanchez', avatar_url: '' }, xp_earned: 8500, trend: 'down' as const },
        { rank: 5, user: { full_name: 'Arthur Dent', avatar_url: '' }, xp_earned: 7200, trend: 'stable' as const },
    ];

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
                            <p className="text-xl font-black text-white">#142</p>
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
                            { icon: Brain, label: "XP Points", value: "2,450", color: "text-sky-400" },
                            { icon: Flame, label: "Day Streak", value: "12", color: "text-orange-400" },
                            { icon: Zap, label: "Level", value: "4", color: "text-purple-400" },
                            { icon: Target, label: "Goals Met", value: "85%", color: "text-emerald-400" },
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
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">3 / 24 Unlocked</p>
                        </div>
                        <BadgeList badges={mockBadges as any} />
                    </div>
                </div>

                {/* Right Column: Leaderboard & Challenges */}
                <div className="space-y-12">
                    <Leaderboard entries={mockLeaderboard} />

                    {/* Active Challenge Card */}
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

                        <div className="relative space-y-6">
                            <div className="flex items-center gap-3">
                                <Zap className="h-5 w-5 text-indigo-400 animate-pulse" />
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Challenge</h3>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-lg font-black text-white uppercase tracking-tight">The Marathon Learner</h4>
                                <p className="text-xs text-indigo-200/60 font-medium italic">Complete 5 hours of tutoring this weekend.</p>
                            </div>

                            <div className="space-y-2">
                                <div className="h-2 w-full bg-slate-950/50 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-indigo-300 uppercase italic">
                                    <span>3.5h Done</span>
                                    <span>Reward: 500 XP + Rare Badge</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

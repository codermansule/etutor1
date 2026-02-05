"use client";

import { Trophy, Medal, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    rank: number;
    user: {
        full_name: string;
        avatar_url?: string;
    };
    xp_earned: number;
    trend: 'up' | 'down' | 'stable';
}

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
}

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-slate-900/30 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Global Rankings</h2>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter italic">Updated hourly</span>
            </div>

            <div className="divide-y divide-white/5">
                {entries.map((entry, i) => (
                    <div
                        key={i}
                        className={cn(
                            "group flex items-center gap-4 p-4 transition-all hover:bg-white/5",
                            entry.rank === 1 && "bg-amber-500/5"
                        )}
                    >
                        <div className="w-8 flex flex-col items-center justify-center">
                            {entry.rank === 1 ? (
                                <Medal className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                            ) : entry.rank === 2 ? (
                                <Medal className="h-5 w-5 text-slate-300" />
                            ) : entry.rank === 3 ? (
                                <Medal className="h-5 w-5 text-amber-700" />
                            ) : (
                                <span className="text-xs font-black text-slate-700 group-hover:text-slate-500 transition-colors">#{entry.rank}</span>
                            )}
                        </div>

                        <Avatar className="h-10 w-10 border border-white/10">
                            {entry.user.avatar_url && (
                                <AvatarImage src={entry.user.avatar_url} alt={entry.user.full_name} />
                            )}
                            <AvatarFallback className="bg-slate-800 text-sky-400 text-xs font-black">
                                {entry.user.full_name?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white truncate">{entry.user.full_name}</h4>
                            <div className="flex items-center gap-2">
                                {entry.trend === 'up' ? (
                                    <ChevronUp className="h-3 w-3 text-emerald-500" />
                                ) : entry.trend === 'down' ? (
                                    <ChevronDown className="h-3 w-3 text-red-500" />
                                ) : (
                                    <Minus className="h-3 w-3 text-slate-600" />
                                )}
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Rising Star</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-black text-white tabular-nums">{entry.xp_earned.toLocaleString()}</p>
                            <p className="text-[9px] text-sky-500/60 font-black uppercase tracking-widest">XP</p>
                        </div>
                    </div>
                ))}
            </div>

            {entries.length === 0 && (
                <div className="p-12 text-center">
                    <p className="text-xs text-slate-600 font-black uppercase tracking-widest italic">No rankings available</p>
                </div>
            )}

            <div className="p-4 bg-slate-900/50 border-t border-white/10 text-center">
                <button className="text-[10px] text-sky-400 font-black uppercase tracking-[0.2em] hover:text-sky-300 transition-colors">
                    View Full Leaderboard
                </button>
            </div>
        </div>
    );
}

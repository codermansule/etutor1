"use client";

import { Target, CheckCircle2, Clock, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Challenge {
    id: string;
    title: string;
    description: string;
    challenge_type: string;
    target_value: number;
    xp_reward: number;
    coin_reward: number;
    ends_at: string;
    joined: boolean;
    currentValue: number;
    completed: boolean;
}

interface ChallengeListProps {
    challenges: Challenge[];
}

export default function ChallengeList({ challenges }: ChallengeListProps) {
    const typeIcons: Record<string, string> = {
        lessons: "📚",
        quizzes: "🧠",
        streak: "🔥",
        xp: "⚡",
        custom: "🎯",
    };

    const formatTimeLeft = (endsAt: string) => {
        const diff = new Date(endsAt).getTime() - Date.now();
        if (diff <= 0) return "Expired";
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) return `${days}d ${hours}h left`;
        return `${hours}h left`;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => {
                const progress = Math.min(
                    Math.round((challenge.currentValue / challenge.target_value) * 100),
                    100
                );

                return (
                    <div
                        key={challenge.id}
                        className={cn(
                            "relative p-6 rounded-3xl border transition-all group",
                            challenge.completed
                                ? "bg-emerald-500/5 border-emerald-500/20"
                                : challenge.joined
                                ? "bg-slate-900/40 border-indigo-500/20 hover:border-indigo-500/40"
                                : "bg-slate-900/40 border-white/5 hover:border-white/10"
                        )}
                    >
                        {challenge.completed && (
                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-lg z-10">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                        {typeIcons[challenge.challenge_type] || "🎯"}
                                    </span>
                                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                                        {challenge.title}
                                    </h3>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-[11px] text-slate-400 italic leading-relaxed">
                                {challenge.description}
                            </p>

                            {/* Progress */}
                            {challenge.joined && (
                                <div className="space-y-2">
                                    <Progress
                                        value={progress}
                                        className={cn(
                                            "h-1.5",
                                            challenge.completed ? "bg-emerald-950" : "bg-slate-800"
                                        )}
                                    />
                                    <div className="flex justify-between text-[10px] font-bold uppercase">
                                        <span className={challenge.completed ? "text-emerald-400" : "text-slate-500"}>
                                            {challenge.currentValue}/{challenge.target_value}
                                        </span>
                                        <span className={challenge.completed ? "text-emerald-400" : "text-slate-500"}>
                                            {challenge.completed ? "Completed!" : `${progress}%`}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div className="flex items-center gap-1">
                                    <Zap className="h-3 w-3 text-sky-400" />
                                    <span className="text-[10px] text-sky-400 font-bold">
                                        {challenge.xp_reward} XP
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-slate-600" />
                                    <span className="text-[10px] text-slate-500 font-bold">
                                        {formatTimeLeft(challenge.ends_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

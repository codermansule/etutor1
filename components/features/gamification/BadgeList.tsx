"use client";

import { Award, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    earned: boolean;
}

interface BadgeListProps {
    badges: Badge[];
}

export default function BadgeList({ badges }: BadgeListProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
                <div
                    key={badge.id}
                    className={cn(
                        "relative group p-6 rounded-3xl border transition-all duration-500",
                        badge.earned
                            ? "bg-slate-900/50 border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.05)]"
                            : "bg-slate-950/50 border-white/5 opacity-40 grayscale"
                    )}
                >
                    {badge.earned && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-slate-950 rounded-full p-1 shadow-lg z-10">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    )}

                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={cn(
                            "h-16 w-16 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 duration-500",
                            badge.earned
                                ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
                                : "bg-slate-900 border-white/10 text-slate-600"
                        )}>
                            <Award className="h-8 w-8" />
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-xs font-black uppercase tracking-widest text-white">{badge.name}</h4>
                            <p className="text-[10px] text-slate-500 font-medium italic leading-tight">{badge.description}</p>
                        </div>

                        <div className={cn(
                            "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter",
                            badge.rarity === 'legendary' ? "bg-amber-500/20 text-amber-500" :
                                badge.rarity === 'epic' ? "bg-purple-500/20 text-purple-500" :
                                    badge.rarity === 'rare' ? "bg-blue-500/20 text-blue-500" :
                                        "bg-slate-800 text-slate-400"
                        )}>
                            {badge.rarity}
                        </div>
                    </div>

                    {!badge.earned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Lock className="h-6 w-6 text-slate-600" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

import AIChat from "@/components/features/ai-tutor/AIChat";
import { Brain, Star, Clock, Target, Award } from "lucide-react";

export default function AITutorPage() {
    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white">AI Tutor Workspace</h1>
                    <p className="text-sm text-slate-400 font-medium italic">Harness the power of GPT-4o for adaptive learning, RAG-powered knowledge, and personalized study plans.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <Brain className="h-5 w-5 text-sky-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Mastery</span>
                                <span className="text-sm font-black text-white">B2 Upper Int</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
                {/* Stats & Sidebar */}
                <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
                    {/* XP Progress Card */}
                    <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-amber-400" />
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Growth</span>
                            </div>
                            <span className="text-xs font-black text-white">Level 4</span>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full w-2/3 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full" />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter italic">
                                <span className="text-sky-400">1240 XP</span>
                                <span className="text-slate-500">2000 XP for Lv 5</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Tools */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Learning Tools</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { icon: Star, title: "Study Goal", desc: "4h / 10h this week", color: "text-amber-400" },
                                { icon: Clock, title: "Active Streak", desc: "12 Days 🔥", color: "text-orange-400" },
                                { icon: Target, title: "Weak Areas", desc: "3 topics to review", color: "text-red-400" },
                            ].map((tool, i) => (
                                <button key={i} className="group p-4 rounded-2xl bg-slate-900/30 border border-white/5 hover:bg-slate-900/50 hover:border-white/10 transition-all text-left flex items-start gap-4">
                                    <div className={`mt-1 h-8 w-8 rounded-xl bg-slate-950 flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                                        <tool.icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors">{tool.title}</p>
                                        <p className="text-[10px] text-slate-500 font-medium italic">{tool.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="space-y-3 pt-4">
                        <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest px-2">Knowledge Base</h3>
                        <div className="p-4 rounded-2xl bg-slate-900/30 border border-white/5 border-dashed text-center">
                            <p className="text-[10px] text-slate-600 font-bold uppercase italic tracking-widest">No documents indexed yet</p>
                        </div>
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="lg:col-span-3 min-h-0">
                    <AIChat />
                </div>
            </div>
        </div>
    );
}

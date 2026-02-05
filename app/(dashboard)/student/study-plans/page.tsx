"use client";

import { useState } from 'react';
import { Brain, Calendar, Clock, BookOpen, Plus, Loader2, Target, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function StudyPlansPage() {
    const [generating, setGenerating] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [goal, setGoal] = useState('');
    const [subjectName, setSubjectName] = useState('');

    const handleCreate = async () => {
        if (!goal || !subjectName) return;
        setGenerating(true);
        try {
            const resp = await fetch('/api/ai/study-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subjectName,
                    goal,
                    experienceLevel: 'beginner'
                })
            });
            const newPlan = await resp.json();
            setPlans([newPlan, ...plans]);
            setShowCreate(false);
            setGoal('');
            setSubjectName('');
        } catch (error) {
            console.error('Failed to generate study plan', error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                        <Brain className="h-8 w-8 text-sky-400" />
                        AI Study Plans
                    </h1>
                    <p className="text-slate-400 mt-1">Adaptive learning paths curated just for your goals.</p>
                </div>
                <Button
                    onClick={() => setShowCreate(true)}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-full px-6"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Study Plan
                </Button>
            </div>

            {showCreate && (
                <Card className="p-8 border-slate-800 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                                <Target className="h-6 w-6 text-sky-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Define Your Learning Goal</h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">What do you want to learn?</label>
                                <Input
                                    placeholder="e.g. Advanced Calculus, Conversational Arabic"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    className="bg-slate-950/50 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">What is your specific objective?</label>
                                <Input
                                    placeholder="e.g. Pass my finals, Prepare for a trip, Build a web app"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="bg-slate-950/50 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-slate-400">Cancel</Button>
                            <Button
                                onClick={handleCreate}
                                disabled={generating || !goal || !subjectName}
                                className="bg-white text-slate-950 font-bold hover:bg-slate-200"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : 'Generate My Plan'}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {plans.length === 0 && !showCreate ? (
                <Card className="p-12 border-dashed border-slate-800 bg-transparent flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Study Plans Yet</h3>
                    <p className="text-slate-400 max-w-sm mb-6">
                        Generate an AI-powered study plan to accelerate your learning journey and stay on track.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setShowCreate(true)}
                        className="border-slate-800 text-slate-300 hover:bg-white/5"
                    >
                        Create Your First Plan
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan: any) => (
                        <Card key={plan.id} className="bg-slate-900/50 border-slate-800 p-6 flex flex-col hover:border-sky-500/50 transition duration-300 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center transition group-hover:scale-110 duration-300">
                                    <BookOpen className="h-6 w-6 text-sky-400" />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Active
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{plan.title}</h3>
                            <div className="space-y-3 mb-6 flex-1">
                                <div className="flex items-center text-sm text-slate-400">
                                    <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                                    {plan.duration_weeks} Weeks
                                </div>
                                <div className="flex items-center text-sm text-slate-400">
                                    <Clock className="h-4 w-4 mr-2 text-slate-500" />
                                    {plan.plan.modules[0]?.estimatedHours || 5}h / week
                                </div>
                            </div>
                            <Button className="w-full bg-slate-950 border border-white/5 hover:bg-white/5 text-slate-300">
                                View Full Syllabus
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

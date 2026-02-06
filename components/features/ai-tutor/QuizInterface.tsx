"use client";

import { useState } from 'react';
import { Check, X, ArrowRight, Loader2, Award, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface QuizRecord {
    id: string;
    title: string;
    questions: Question[];
}

interface QuizInterfaceProps {
    quiz: QuizRecord;
    onComplete: (score: number, xpEarned?: number) => void;
    onClose: () => void;
}

export default function QuizInterface({ quiz, onComplete, onClose }: QuizInterfaceProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showResults, setShowResults] = useState(false);
    const [xpEarned, setXpEarned] = useState<number | null>(null);
    const [awarding, setAwarding] = useState(false);

    const currentQuestion = quiz.questions[currentStep];
    const progress = ((currentStep + 1) / quiz.questions.length) * 100;

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
    };

    const handleConfirm = () => {
        setIsAnswered(true);
        if (selectedAnswer) {
            setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer }));
        }
        if (selectedAnswer === currentQuestion.correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = async () => {
        if (currentStep < quiz.questions.length - 1) {
            setCurrentStep(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setShowResults(true);
            const finalCorrect = score + (selectedAnswer === quiz.questions[currentStep].correctAnswer ? 1 : 0);
            const finalScoreNum = Math.round((finalCorrect / quiz.questions.length) * 100);

            setAwarding(true);
            try {
                // Save quiz attempt and award XP in parallel
                const [, awardResp] = await Promise.all([
                    fetch('/api/ai/quiz/attempt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            quizId: quiz.id,
                            answers,
                            score: finalScoreNum,
                            correctCount: finalCorrect,
                            totalCount: quiz.questions.length,
                        }),
                    }).catch(() => null),
                    fetch('/api/gamification/award', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'quiz_completed',
                            referenceId: quiz.id,
                            description: `Completed quiz: ${quiz.title} (${finalScoreNum}%)`,
                        }),
                    }),
                ]);
                const data = await awardResp.json();
                if (data.xpEarned) setXpEarned(data.xpEarned);
            } catch {
                // Don't break the quiz flow
            } finally {
                setAwarding(false);
            }
        }
    };

    if (showResults) {
        const finalScorePercent = Math.round((score / quiz.questions.length) * 100);
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-8 p-12 text-center"
            >
                <div className="relative">
                    <div className="h-32 w-32 rounded-full border-4 border-sky-500/20 flex items-center justify-center">
                        <Award className="h-16 w-16 text-sky-400 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-widest">Quiz Completed!</h2>
                    <p className="text-slate-400 italic">Excellent work on your {quiz.title} assessment.</p>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
                    <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Score</p>
                        <p className="text-2xl font-black text-white">{finalScorePercent}%</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">XP Earned</p>
                        <p className="text-2xl font-black text-sky-400">
                            {awarding ? '...' : xpEarned !== null ? `+${xpEarned}` : '+20'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col w-full max-w-sm gap-3">
                    <Button onClick={() => onComplete(score, xpEarned ?? undefined)} className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black h-12 rounded-2xl uppercase tracking-widest">
                        Claim Rewards
                    </Button>
                    <Button onClick={onClose} variant="ghost" className="text-slate-400 hover:text-white uppercase font-bold text-[10px] tracking-widest">
                        Close
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Quiz Header */}
            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-[10px] text-sky-500 font-black uppercase tracking-[0.2em]">{quiz.title}</p>
                        <h3 className="text-xl font-black text-white uppercase">Question {currentStep + 1} of {quiz.questions.length}</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500 italic tabular-nums">{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-slate-800" />
            </div>

            {/* Question Content */}
            <div className="flex-1 space-y-8 min-h-0 overflow-y-auto pr-2 scrollbar-hide">
                <p className="text-lg font-bold text-white leading-relaxed">{currentQuestion.question}</p>

                <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = isAnswered && option === currentQuestion.correctAnswer;
                        const isWrong = isAnswered && isSelected && option !== currentQuestion.correctAnswer;

                        return (
                            <button
                                key={idx}
                                disabled={isAnswered}
                                onClick={() => handleAnswerSelect(option)}
                                className={cn(
                                    "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left group",
                                    !isAnswered && "hover:bg-slate-800/50 bg-slate-900/30 border-white/5",
                                    !isAnswered && isSelected && "bg-sky-500/10 border-sky-500/50 text-sky-400",
                                    isCorrect && "bg-emerald-500/10 border-emerald-500/50 text-emerald-400",
                                    isWrong && "bg-red-500/10 border-red-500/50 text-red-400"
                                )}
                            >
                                <span className="text-sm font-medium">{option}</span>
                                <div className={cn(
                                    "h-6 w-6 rounded-full border flex items-center justify-center transition-all",
                                    !isAnswered && "border-white/10 group-hover:border-sky-500/50",
                                    !isAnswered && isSelected && "border-sky-500 bg-sky-500/20",
                                    isCorrect && "border-emerald-500 bg-emerald-500 text-slate-950",
                                    isWrong && "border-red-500 bg-red-500 text-slate-950"
                                )}>
                                    {isCorrect && <Check className="h-4 w-4" />}
                                    {isWrong && <X className="h-4 w-4" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {isAnswered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "p-6 rounded-3xl border",
                                selectedAnswer === currentQuestion.correctAnswer
                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                    : "bg-red-500/5 border-red-500/20"
                            )}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
                                    selectedAnswer === currentQuestion.correctAnswer ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-500"
                                )}>
                                    <Brain className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Explanation</p>
                                    <p className="text-xs text-slate-300 leading-relaxed italic">{currentQuestion.explanation}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quiz Footer */}
            <div className="pt-8 border-t border-white/5 mt-8 flex justify-end">
                {!isAnswered ? (
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedAnswer}
                        className="bg-white text-slate-950 px-8 rounded-full font-black uppercase text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        Confirm Answer
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-8 rounded-full font-black uppercase text-xs tracking-[0.2em] flex items-center gap-2"
                    >
                        {currentStep < quiz.questions.length - 1 ? 'Next Question' : 'View Results'}
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

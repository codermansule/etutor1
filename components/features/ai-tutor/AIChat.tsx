"use client";

import { DefaultChatTransport } from 'ai';
import { Chat, useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Loader2, Sparkles, Brain, Code, Quote, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import QuizInterface from './QuizInterface';

interface AIChatProps {
    subjectId?: string;
}

export default function AIChat({ subjectId }: AIChatProps) {
    const [activeQuiz, setActiveQuiz] = useState<any>(null);
    const [generatingQuiz, setGeneratingQuiz] = useState(false);
    const [input, setInput] = useState('');

    const chat = useMemo(() => new Chat({
        transport: new DefaultChatTransport({
            api: '/api/ai/chat',
            body: {
                subjectId,
                mode: 'chat',
            },
        })
    }), [subjectId]);

    const { messages, status, sendMessage, error } = useChat({ chat });

    const isLoading = status === 'streaming';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage({ text: input });
        setInput('');
    };

    const startQuiz = async () => {
        setGeneratingQuiz(true);
        try {
            const resp = await fetch('/api/ai/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subjectId: subjectId || 'placeholder', topics: ['General knowledge'] })
            });
            const data = await resp.json();
            setActiveQuiz(data);
        } catch (e) {
            console.error('Failed to generate quiz', e);
        } finally {
            setGeneratingQuiz(false);
        }
    };

    const handleQuizComplete = async (score: number, xpEarned?: number) => {
        setActiveQuiz(null);
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (activeQuiz) {
        return (
            <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-2xl relative">
                <button
                    onClick={() => setActiveQuiz(null)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
                <QuizInterface
                    quiz={activeQuiz}
                    onComplete={handleQuizComplete}
                    onClose={() => setActiveQuiz(null)}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/30 backdrop-blur-xl shadow-2xl relative">
            {generatingQuiz && (
                <div className="absolute inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20 animate-bounce">
                        <Brain className="h-8 w-8" />
                    </div>
                    <p className="text-xs font-black text-sky-400 uppercase tracking-[0.3em] animate-pulse">Generating Custom Quiz...</p>
                </div>
            )}
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tighter">AI Learning Assistant</h2>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by GPT-4o</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl">
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth scrollbar-hide">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60 max-w-sm mx-auto">
                        <div className="h-20 w-20 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500 border border-sky-500/20">
                            <Brain className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-black uppercase tracking-wider">Start a Conversation</h3>
                            <p className="text-xs text-slate-400 italic font-medium leading-relaxed">
                                Ask me about complex theories, request sub-topic explanations, or generate practice questions for your current session.
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            "flex w-full group",
                            m.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "max-w-[85%] space-y-2",
                            m.role === 'user' ? "items-end" : "items-start"
                        )}>
                            <div className={cn(
                                "p-5 rounded-2xl text-sm leading-relaxed shadow-sm",
                                m.role === 'user'
                                    ? "bg-sky-500 text-slate-950 font-medium rounded-tr-none"
                                    : "bg-slate-800/80 text-white rounded-tl-none border border-white/5 backdrop-blur-sm"
                            )}>
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {m.parts.map((part: any, i: number) => {
                                        if (part.type === 'text') {
                                            return (
                                                <ReactMarkdown
                                                    key={i}
                                                    components={{
                                                        h1: ({ node, ...props }) => <h1 className="text-white font-black mb-2 mt-4" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-white font-black mb-2 mt-4" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="text-sky-400 font-bold" {...props} />,
                                                        code: ({ node, ...props }) => <code className="bg-slate-950/50 p-1 rounded font-mono text-xs" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                                                    }}
                                                >
                                                    {part.text}
                                                </ReactMarkdown>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                            <div className={cn(
                                "flex items-center gap-2",
                                m.role === 'user' ? "justify-end" : "justify-start"
                            )}>
                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                                    {m.role === 'user' ? 'You' : 'Assistant'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800/80 p-5 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-3">
                            <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                            <span className="text-xs text-sky-400 font-black uppercase tracking-widest animate-pulse">Thinking</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs italic text-center">
                        An error occurred. Please try again.
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-slate-900/50 border-t border-white/10">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Ask anything..."
                        className="flex-1 bg-slate-950/80 border-white/5 h-16 pl-6 pr-16 rounded-2xl text-sm italic focus-visible:ring-sky-500/50 shadow-inner"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-2 h-12 w-12 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 p-0 shadow-lg shadow-sky-500/20"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
                <div className="mt-4 flex items-center gap-4 px-2">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Shortcuts</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={startQuiz}
                            className="text-[9px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded-md border border-white/5 font-bold uppercase tracking-tighter transition-colors"
                        >
                            Quiz Me
                        </button>
                        <button className="text-[9px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded-md border border-white/5 font-bold uppercase tracking-tighter transition-colors">Explain Concept</button>
                        <button className="text-[9px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded-md border border-white/5 font-bold uppercase tracking-tighter transition-colors">Summary</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

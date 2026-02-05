"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    BrainCircuit,
    Upload,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Info
} from 'lucide-react';

export default function AdminIngestionPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        subjectId: '', // Ideally this would be a select from subjects
        sourceUrl: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const resp = await fetch('/api/admin/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (resp.ok) {
                const result = await resp.json();
                setStatus({
                    type: 'success',
                    message: `Successfully ingested "${formData.title}" into ${result.totalChunks} chunks.`
                });
                setFormData({ title: '', content: '', subjectId: '', sourceUrl: '' });
            } else {
                const err = await resp.text();
                setStatus({ type: 'error', message: err || 'Ingestion failed' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                    <BrainCircuit className="h-8 w-8 text-sky-400" />
                    AI Knowledge Ingestion
                </h1>
                <p className="text-slate-400 mt-1">Ground the AI Tutor with factual course materials and documents.</p>
            </div>

            <Card className="bg-slate-900/50 border-white/5 p-8 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Upload className="h-32 w-32 text-white" />
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Document Title</label>
                            <Input
                                placeholder="e.g. Introduction to Quantum Physics"
                                value={formData.title}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="bg-slate-950/50 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-300">Subject ID (UUID)</label>
                            <Input
                                placeholder="Paste the subject UUID"
                                value={formData.subjectId}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subjectId: e.target.value })}
                                required
                                className="bg-slate-950/50 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300">Content Body</label>
                        <Textarea
                            placeholder="Paste the educational content here..."
                            rows={12}
                            value={formData.content}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, content: e.target.value })}
                            required
                            className="bg-slate-950/50 border-white/10 resize-none"
                        />
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            Content will be automatically chunked into 800-character segments for optimal RAG performance.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300">Source URL (Optional)</label>
                        <Input
                            placeholder="https://example.com/source-pdf"
                            value={formData.sourceUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, sourceUrl: e.target.value })}
                            className="bg-slate-950/50 border-white/10"
                        />
                    </div>

                    {status && (
                        <div className={cn(
                            "p-4 rounded-xl flex items-start gap-3",
                            status.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        )}>
                            {status.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                            <p className="text-sm font-medium">{status.message}</p>
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-8 h-12 rounded-xl"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Processing Embeddings...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-5 w-5" />
                                    Start Ingestion
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-2xl bg-white/5 space-y-2">
                    <h4 className="text-sm font-bold text-white">Chunking Logic</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Splits document into overlapping segments to preserve context across boundaries.
                    </p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 space-y-2">
                    <h4 className="text-sm font-bold text-white">OpenAI Integration</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Converts text into 1536-dimensional vectors using text-embedding-3-small.
                    </p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 space-y-2">
                    <h4 className="text-sm font-bold text-white">Vector Store</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Stores results in Supabase pgvector for lightning-fast similarity searching.
                    </p>
                </div>
            </div>
        </div>
    );
}

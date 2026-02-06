'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    level: 'all_levels',
    price: '',
    is_free: true,
  });

  useEffect(() => {
    supabase.from('subjects').select('id, name').order('name').then(({ data }) => {
      setSubjects(data ?? []);
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: form.is_free ? 0 : parseFloat(form.price) || 0,
          subject_id: form.subject_id || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/tutor/courses/${data.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card className="bg-slate-900/50 border-white/5 p-8">
        <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-6">Create New Course</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Course Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Introduction to Calculus"
              className="bg-slate-950/50 border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will students learn?"
              rows={4}
              className="flex w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Subject</Label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                className="flex w-full h-10 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
              >
                <option value="">Select subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Level</Label>
              <select
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="flex w-full h-10 rounded-xl border border-white/10 bg-slate-950/50 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
              >
                <option value="all_levels">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_free"
                checked={form.is_free}
                onChange={(e) => setForm({ ...form, is_free: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_free" className="text-sm text-slate-300">This course is free</Label>
            </div>
            {!form.is_free && (
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="29.99"
                  className="bg-slate-950/50 border-white/10 text-white"
                />
              </div>
            )}
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-sky-500 text-slate-950 font-bold h-12">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Create Course</>}
          </Button>
        </form>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical, Globe, Save } from 'lucide-react';

export default function CourseEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: '', description: '', content: '', duration_minutes: '', is_free_preview: false });
  const [addingLesson, setAddingLesson] = useState(false);

  const loadCourse = useCallback(async () => {
    const [courseRes, lessonsRes] = await Promise.all([
      fetch(`/api/courses/${params.id}`),
      fetch(`/api/courses/${params.id}/lessons`),
    ]);
    const courseData = await courseRes.json();
    const lessonsData = await lessonsRes.json();
    setCourse(courseData);
    setLessons(Array.isArray(lessonsData) ? lessonsData : []);
    setLoading(false);
  }, [params.id]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  const handleUpdate = async (updates: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok) setCourse(data);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title.trim()) return;
    setAddingLesson(true);
    try {
      const res = await fetch(`/api/courses/${params.id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLesson,
          sort_order: lessons.length,
          duration_minutes: parseInt(newLesson.duration_minutes) || null,
        }),
      });
      if (res.ok) {
        setNewLesson({ title: '', description: '', content: '', duration_minutes: '', is_free_preview: false });
        await loadCourse();
      }
    } finally {
      setAddingLesson(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-sky-400" /></div>;
  if (!course) return <div className="text-center py-20 text-white">Course not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/tutor/courses')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex gap-2">
          {course.status === 'draft' && (
            <Button onClick={() => handleUpdate({ status: 'published' })} className="bg-emerald-500 text-white font-bold">
              <Globe className="h-4 w-4 mr-2" /> Publish
            </Button>
          )}
          {course.status === 'published' && (
            <Button onClick={() => handleUpdate({ status: 'draft' })} variant="outline" className="border-white/10 text-white">
              Unpublish
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-slate-900/50 border-white/5 p-6 space-y-4">
        <h2 className="text-lg font-black text-white uppercase tracking-wider">Course Details</h2>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Title</Label>
          <Input
            value={course.title}
            onChange={(e) => setCourse({ ...course, title: e.target.value })}
            onBlur={() => handleUpdate({ title: course.title })}
            className="bg-slate-950/50 border-white/10 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</Label>
          <textarea
            value={course.description || ''}
            onChange={(e) => setCourse({ ...course, description: e.target.value })}
            onBlur={() => handleUpdate({ description: course.description })}
            rows={3}
            className="flex w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`px-2 py-1 rounded-full ${course.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
            {course.status}
          </span>
          <span>{course.lesson_count} lessons</span>
          <span>{course.enrolled_count} enrolled</span>
        </div>
      </Card>

      <Card className="bg-slate-900/50 border-white/5 p-6 space-y-6">
        <h2 className="text-lg font-black text-white uppercase tracking-wider">Lessons</h2>

        {lessons.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">No lessons yet. Add your first lesson below.</p>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, i) => (
              <div key={lesson.id} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                <GripVertical className="h-4 w-4 text-slate-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{i + 1}. {lesson.title}</p>
                  {lesson.description && <p className="text-xs text-slate-500 truncate">{lesson.description}</p>}
                </div>
                {lesson.is_free_preview && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">Preview</span>
                )}
                {lesson.duration_minutes && (
                  <span className="text-xs text-slate-500">{lesson.duration_minutes}m</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-white/10 pt-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add New Lesson</h3>
          <div className="grid gap-4">
            <Input
              value={newLesson.title}
              onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
              placeholder="Lesson title"
              className="bg-slate-950/50 border-white/10 text-white"
            />
            <textarea
              value={newLesson.content}
              onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
              placeholder="Lesson content (markdown supported)"
              rows={4}
              className="flex w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
            />
            <div className="flex gap-4 items-center">
              <Input
                type="number"
                value={newLesson.duration_minutes}
                onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: e.target.value })}
                placeholder="Duration (min)"
                className="bg-slate-950/50 border-white/10 text-white w-40"
              />
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={newLesson.is_free_preview}
                  onChange={(e) => setNewLesson({ ...newLesson, is_free_preview: e.target.checked })}
                  className="rounded"
                />
                Free preview
              </label>
            </div>
            <Button onClick={handleAddLesson} disabled={addingLesson || !newLesson.title.trim()} className="bg-sky-500 text-slate-950 font-bold w-fit">
              {addingLesson ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-2" /> Add Lesson</>}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

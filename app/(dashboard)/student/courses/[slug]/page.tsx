import { createServerClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { BookOpen, Clock, Users, GraduationCap, Lock, Play } from 'lucide-react';
import CourseEnrollButton from './CourseEnrollButton';

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: course } = await supabase
    .from('courses')
    .select('*, subjects(name), tutor_profiles(profiles(full_name, avatar_url)), course_lessons(id, title, description, sort_order, duration_minutes, is_free_preview)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .select('id, progress, completed_lessons')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .single();

  const isEnrolled = !!enrollment;
  const lessons = (course.course_lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
  const completedLessons: string[] = enrollment?.completed_lessons || [];
  const totalDuration = lessons.reduce((sum: number, l: any) => sum + (l.duration_minutes || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {course.subjects?.name && <span className="px-2 py-1 rounded-full bg-sky-500/10 text-sky-400 font-bold uppercase tracking-widest">{course.subjects.name}</span>}
          <span className="uppercase tracking-widest font-bold">{course.level.replace('_', ' ')}</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">{course.title}</h1>
        <p className="text-slate-400">{course.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {lessons.length} lessons</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {totalDuration} min total</span>
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrolled_count} students</span>
          {course.tutor_profiles?.profiles?.full_name && (
            <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {course.tutor_profiles.profiles.full_name}</span>
          )}
        </div>
      </div>

      {!isEnrolled && (
        <Card className="bg-sky-500/10 border-sky-500/20 p-6 flex items-center justify-between">
          <div>
            <p className="text-white font-bold">{course.is_free ? 'Free Course' : `$${course.price}`}</p>
            <p className="text-sm text-slate-400">Enroll to access all lessons</p>
          </div>
          <CourseEnrollButton courseId={course.id} />
        </Card>
      )}

      {isEnrolled && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span>{Math.round(enrollment.progress || 0)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 transition-all" style={{ width: `${enrollment.progress || 0}%` }} />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-black text-white uppercase tracking-wider">Course Content</h2>
        {lessons.map((lesson: any, i: number) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const canAccess = isEnrolled || lesson.is_free_preview;
          return (
            <Card key={lesson.id} className={`p-4 flex items-center gap-4 ${canAccess ? 'bg-slate-900/50 border-white/5' : 'bg-slate-900/30 border-white/3 opacity-60'}`}>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : canAccess ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-600'}`}>
                {canAccess ? <Play className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{i + 1}. {lesson.title}</p>
                {lesson.description && <p className="text-xs text-slate-500 truncate">{lesson.description}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {lesson.is_free_preview && !isEnrolled && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">Preview</span>
                )}
                {lesson.duration_minutes && <span className="text-xs text-slate-500">{lesson.duration_minutes}m</span>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

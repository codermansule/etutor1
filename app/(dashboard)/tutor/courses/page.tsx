import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Users, Eye, Pencil } from 'lucide-react';

export default async function TutorCoursesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: courses } = await supabase
    .from('courses')
    .select('*, subjects(name)')
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false });

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-500/10 text-slate-400',
    published: 'bg-emerald-500/10 text-emerald-400',
    archived: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">My Courses</h1>
          <p className="text-slate-400 mt-1 text-sm">Create and manage your online courses.</p>
        </div>
        <Link href="/tutor/courses/new">
          <Button className="bg-sky-500 text-slate-950 font-bold">
            <Plus className="h-4 w-4 mr-2" /> New Course
          </Button>
        </Link>
      </div>

      {(!courses || courses.length === 0) ? (
        <Card className="bg-slate-900/50 border-white/5 p-12 text-center">
          <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No courses yet</h3>
          <p className="text-sm text-slate-500 mb-6">Create your first course and start sharing your knowledge.</p>
          <Link href="/tutor/courses/new">
            <Button className="bg-sky-500 text-slate-950 font-bold">
              <Plus className="h-4 w-4 mr-2" /> Create Course
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => (
            <Card key={course.id} className="bg-slate-900/50 border-white/5 p-6 hover:border-white/10 transition flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${statusColors[course.status] || ''}`}>
                  {course.status}
                </span>
                <span className="text-xs text-slate-500">{course.level}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2 flex-1">{course.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.lesson_count} lessons</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrolled_count} enrolled</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/tutor/courses/${course.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 text-white text-xs">
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </Link>
                {course.status === 'published' && (
                  <Link href={`/student/courses/${course.slug}`}>
                    <Button variant="ghost" className="text-sky-400 text-xs">
                      <Eye className="h-3 w-3 mr-1" /> View
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

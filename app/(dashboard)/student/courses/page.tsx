import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, GraduationCap } from 'lucide-react';

export default async function StudentCoursesPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [coursesRes, enrollmentsRes] = await Promise.all([
    supabase.from('courses').select('*, subjects(name), tutor_profiles(profiles(full_name))').eq('status', 'published').order('enrolled_count', { ascending: false }),
    supabase.from('course_enrollments').select('course_id, progress').eq('student_id', user.id),
  ]);

  const courses = coursesRes.data ?? [];
  const enrollmentMap = new Map((enrollmentsRes.data ?? []).map((e) => [e.course_id, e]));

  const enrolledCourses = courses.filter((c) => enrollmentMap.has(c.id));
  const browseCourses = courses.filter((c) => !enrollmentMap.has(c.id));

  const levelColors: Record<string, string> = {
    beginner: 'text-emerald-400',
    intermediate: 'text-amber-400',
    advanced: 'text-red-400',
    all_levels: 'text-sky-400',
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Courses</h1>
        <p className="text-slate-400 mt-1 text-sm">Browse and enroll in courses to enhance your learning journey.</p>
      </div>

      {enrolledCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-sky-400" />
            My Enrolled Courses
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course: any) => {
              const enrollment = enrollmentMap.get(course.id);
              return (
                <Link key={course.id} href={`/student/courses/${course.slug}`}>
                  <Card className="bg-slate-900/50 border-white/5 p-6 hover:border-sky-500/30 transition cursor-pointer h-full">
                    <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{course.description}</p>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-3">
                      <div className="h-full bg-sky-500 transition-all" style={{ width: `${enrollment?.progress || 0}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{Math.round(enrollment?.progress || 0)}% complete</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sky-400" />
          Browse Courses
        </h2>
        {browseCourses.length === 0 ? (
          <Card className="bg-slate-900/50 border-white/5 p-12 text-center">
            <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-sm text-slate-500">No courses available yet. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {browseCourses.map((course: any) => (
              <Link key={course.id} href={`/student/courses/${course.slug}`}>
                <Card className="bg-slate-900/50 border-white/5 p-6 hover:border-white/10 transition cursor-pointer h-full flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${levelColors[course.level] || ''}`}>{course.level.replace('_', ' ')}</span>
                    {course.is_free ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Free</span>
                    ) : (
                      <span className="text-sm font-bold text-white">${course.price}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{course.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2 flex-1">{course.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.lesson_count} lessons</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrolled_count} students</span>
                  </div>
                  {course.tutor_profiles?.profiles?.full_name && (
                    <p className="text-xs text-slate-500 mt-2">by {course.tutor_profiles.profiles.full_name}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

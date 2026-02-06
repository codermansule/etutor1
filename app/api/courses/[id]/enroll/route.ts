import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check course exists and is published
    const { data: course } = await supabase
      .from('courses')
      .select('id, status')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    // Enroll
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({ student_id: user.id, course_id: id })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Already enrolled' }, { status: 409 });
      throw error;
    }

    // Increment enrolled_count
    const { count } = await supabase
      .from('course_enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', id);

    await supabase
      .from('courses')
      .update({ enrolled_count: count || 0 })
      .eq('id', id);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

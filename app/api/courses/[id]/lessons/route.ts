import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { captureError } from '@/lib/monitoring/sentry';
import { lessonCreateSchema, parseBody } from '@/lib/validations/api-schemas';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('course_id', id)
      .order('sort_order');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    captureError(error, { route: 'GET /api/courses/[id]/lessons' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('id', id)
      .eq('tutor_id', user.id)
      .single();

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    const parsed = parseBody(lessonCreateSchema, await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const body = parsed.data;
    const { data, error } = await supabase
      .from('course_lessons')
      .insert({
        course_id: id,
        title: body.title,
        description: body.description,
        content: body.content,
        video_url: body.video_url,
        sort_order: body.sort_order,
        duration_minutes: body.duration_minutes,
        is_free_preview: body.is_free_preview,
      })
      .select()
      .single();

    if (error) throw error;

    // Update lesson count
    const { count } = await supabase
      .from('course_lessons')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', id);

    await supabase
      .from('courses')
      .update({ lesson_count: count || 0 })
      .eq('id', id);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    captureError(error, { route: 'POST /api/courses/[id]/lessons' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

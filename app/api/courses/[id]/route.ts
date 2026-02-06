import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { captureError } from '@/lib/monitoring/sentry';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('courses')
      .select('*, subjects(name), tutor_profiles(profiles(full_name, avatar_url)), course_lessons(id, title, description, sort_order, duration_minutes, is_free_preview)')
      .eq('id', id)
      .single();

    if (error || !data) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    captureError(error, { route: 'GET /api/courses/[id]' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { data, error } = await supabase
      .from('courses')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('tutor_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    captureError(error, { route: 'PATCH /api/courses/[id]' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
      .eq('tutor_id', user.id)
      .eq('status', 'draft');

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error, { route: 'DELETE /api/courses/[id]' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

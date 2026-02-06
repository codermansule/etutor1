import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const url = new URL(req.url);
    const subjectId = url.searchParams.get('subject_id');
    const level = url.searchParams.get('level');
    const search = url.searchParams.get('search');
    const tutorId = url.searchParams.get('tutor_id');

    let query = supabase
      .from('courses')
      .select('*, subjects(name), tutor_profiles(profiles(full_name, avatar_url))')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (subjectId) query = query.eq('subject_id', subjectId);
    if (level && level !== 'all_levels') query = query.eq('level', level);
    if (search) query = query.ilike('title', `%${search}%`);
    if (tutorId) query = query.eq('tutor_id', tutorId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Courses GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);

    const { data, error } = await supabase
      .from('courses')
      .insert({
        tutor_id: user.id,
        subject_id: body.subject_id || null,
        title: body.title,
        slug,
        description: body.description || '',
        price: body.price || 0,
        is_free: body.is_free || false,
        level: body.level || 'all_levels',
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Course POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

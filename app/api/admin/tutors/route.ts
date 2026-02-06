import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { captureError } from '@/lib/monitoring/sentry';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin' && user.email !== 'admin@etutor.studybitests.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('tutor_profiles')
      .select('id, bio, hourly_rate, is_verified, rating, total_reviews, profiles(full_name, email, avatar_url, created_at)')
      .eq('is_verified', false)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    captureError(error, { route: 'GET /api/admin/tutors' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin' && user.email !== 'admin@etutor.studybitests.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { tutorId, action } = await req.json();
    if (!tutorId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (action === 'approve') {
      const { error } = await supabase
        .from('tutor_profiles')
        .update({ is_verified: true })
        .eq('id', tutorId);
      if (error) throw error;
    } else {
      // For reject, just mark as not verified (could also delete)
      const { error } = await supabase
        .from('tutor_profiles')
        .update({ is_verified: false })
        .eq('id', tutorId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error, { route: 'PATCH /api/admin/tutors' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

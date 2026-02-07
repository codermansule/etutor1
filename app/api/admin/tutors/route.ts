import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import { captureError } from '@/lib/monitoring/sentry';
import { adminTutorActionSchema, parseBody } from '@/lib/validations/api-schemas';

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
      .select('id, bio, hourly_rate, is_verified, average_rating, rating_count, profiles(full_name, email, avatar_url, created_at)')
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

    const parsed = parseBody(adminTutorActionSchema, await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { tutorId, action } = parsed.data;

    // Use service role to bypass RLS (admin can't update other users' profiles via RLS)
    const adminClient = createServiceRoleClient();

    if (action === 'approve') {
      const { error } = await adminClient
        .from('tutor_profiles')
        .update({ is_verified: true, is_approved: true })
        .eq('id', tutorId);
      if (error) throw error;
    } else {
      const { error } = await adminClient
        .from('tutor_profiles')
        .update({ is_verified: false, is_approved: false })
        .eq('id', tutorId);
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error, { route: 'PATCH /api/admin/tutors' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

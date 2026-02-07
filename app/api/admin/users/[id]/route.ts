import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { captureError } from '@/lib/monitoring/sentry';
import { adminUserUpdateSchema, parseBody } from '@/lib/validations/api-schemas';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (adminProfile?.role !== 'admin' && user.email !== 'admin@etutor.studybitests.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = parseBody(adminUserUpdateSchema, await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const updates = parsed.data;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    captureError(error, { route: 'PATCH /api/admin/users/[id]' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

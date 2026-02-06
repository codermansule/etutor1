import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { ingestDocument } from '@/lib/ai/ingestion';
import { captureError } from '@/lib/monitoring/sentry';

export async function POST(req: Request) {
    try {
        const { title, content, subjectId, metadata, sourceUrl } = await req.json();
        const supabase = await createServerClient();

        // 1. Verify admin/tutor role
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new NextResponse('Unauthorized', { status: 401 });

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin' && profile?.role !== 'tutor') {
            return new NextResponse('Forbidden', { status: 403 });
        }

        // 2. Perform ingestion
        const result = await ingestDocument({
            title,
            content,
            subjectId,
            metadata,
            sourceUrl
        });

        if (!result.success) {
            return NextResponse.json({
                error: 'Partial ingestion failure',
                details: result
            }, { status: 207 });
        }

        return NextResponse.json(result);
    } catch (error) {
        captureError(error, { route: 'POST /api/admin/ingest' });
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

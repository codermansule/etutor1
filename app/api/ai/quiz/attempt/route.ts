import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { captureError } from '@/lib/monitoring/sentry';

export async function POST(req: Request) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { quizId, answers, score, correctCount, totalCount } = await req.json();

        if (!quizId || score == null || correctCount == null || totalCount == null) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('ai_quiz_attempts')
            .insert({
                quiz_id: quizId,
                user_id: user.id,
                answers: answers || {},
                score,
                correct_count: correctCount,
                total_count: totalCount,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Quiz attempt save error:', error);
            return NextResponse.json({ error: 'Failed to save attempt' }, { status: 500 });
        }

        return NextResponse.json({ success: true, attemptId: data.id });
    } catch (error) {
        captureError(error, { route: 'POST /api/ai/quiz/attempt' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

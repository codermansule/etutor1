import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { awardXPWithClient, type GamificationEvent, XP_VALUES } from '@/lib/gamification/engine';
import { updateStreakWithClient } from '@/lib/gamification/engine';
import { checkBadges } from '@/lib/gamification/badges';
import { updateChallengeProgress } from '@/lib/gamification/challenges';
import { captureError } from '@/lib/monitoring/sentry';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { event, referenceId, description } = await req.json();

        if (!event || !XP_VALUES[event]) {
            return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
        }

        const result = await awardXPWithClient(
            supabase,
            user.id,
            event as GamificationEvent,
            referenceId,
            description
        );

        // Update streak, check badges, and update challenge progress in parallel
        const [streakResult, badgeResult] = await Promise.all([
            updateStreakWithClient(supabase, user.id),
            checkBadges(user.id, supabase),
            updateChallengeProgress(user.id, event as GamificationEvent, supabase),
        ]);

        return NextResponse.json({
            ...result,
            streak: streakResult,
            badges: badgeResult,
        });
    } catch (error) {
        captureError(error, { route: 'POST /api/gamification/award' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

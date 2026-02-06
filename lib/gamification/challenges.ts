import { createServerClient } from '@/lib/supabase/server';
import { awardXPWithClient, type GamificationEvent } from './engine';
import type { SupabaseClient } from '@supabase/supabase-js';

// Map gamification events to challenge types
const EVENT_TO_CHALLENGE_TYPE: Partial<Record<GamificationEvent, string>> = {
    lesson_completed: 'lessons',
    quiz_completed: 'quizzes',
};

/**
 * Auto-join a user to all active challenges they haven't joined yet.
 */
export async function autoJoinChallenges(userId: string, client?: SupabaseClient) {
    const supabase = client || await createServerClient();

    const { data: activeChallenges } = await supabase
        .from('challenges')
        .select('id')
        .eq('is_active', true)
        .gte('ends_at', new Date().toISOString());

    if (!activeChallenges?.length) return;

    const { data: joined } = await supabase
        .from('user_challenges')
        .select('challenge_id')
        .eq('user_id', userId);

    const joinedIds = new Set((joined ?? []).map((j) => j.challenge_id));
    const toJoin = activeChallenges.filter((c) => !joinedIds.has(c.id));

    if (toJoin.length > 0) {
        await supabase.from('user_challenges').insert(
            toJoin.map((c) => ({
                user_id: userId,
                challenge_id: c.id,
                current_value: 0,
            }))
        );
    }
}

/**
 * Update challenge progress after an XP-earning event.
 * Call this after awardXP to increment relevant challenge counters.
 */
export async function updateChallengeProgress(
    userId: string,
    event: GamificationEvent,
    client?: SupabaseClient
) {
    const supabase = client || await createServerClient();
    const challengeType = EVENT_TO_CHALLENGE_TYPE[event];

    // For streak-type challenges, we handle them separately
    if (!challengeType && event !== 'streak_bonus') return;

    // Get user's active (non-completed) challenges
    const { data: userChallenges } = await supabase
        .from('user_challenges')
        .select('id, challenge_id, current_value, completed, challenges!inner(challenge_type, target_value, xp_reward, coin_reward, ends_at)')
        .eq('user_id', userId)
        .eq('completed', false);

    if (!userChallenges?.length) return;

    for (const uc of userChallenges) {
        const challenge = (uc as any).challenges;
        if (!challenge) continue;

        // Check if challenge is still active
        if (new Date(challenge.ends_at) < new Date()) continue;

        let shouldIncrement = false;

        if (challengeType && challenge.challenge_type === challengeType) {
            shouldIncrement = true;
        }

        // Streak challenges: check actual streak value instead of incrementing
        if (challenge.challenge_type === 'streak') {
            const { data: streak } = await supabase
                .from('user_streaks')
                .select('current_streak')
                .eq('id', userId)
                .single();

            const currentStreak = streak?.current_streak ?? 0;

            if (currentStreak >= challenge.target_value && !uc.completed) {
                // Complete the challenge
                await supabase
                    .from('user_challenges')
                    .update({
                        current_value: currentStreak,
                        completed: true,
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', uc.id);

                await awardXPWithClient(
                    supabase,
                    userId,
                    'challenge_completed',
                    uc.challenge_id,
                    `Completed challenge: streak of ${challenge.target_value} days`
                );
            } else {
                await supabase
                    .from('user_challenges')
                    .update({ current_value: currentStreak })
                    .eq('id', uc.id);
            }
            continue;
        }

        if (!shouldIncrement) continue;

        const newValue = uc.current_value + 1;

        if (newValue >= challenge.target_value) {
            // Challenge completed
            await supabase
                .from('user_challenges')
                .update({
                    current_value: newValue,
                    completed: true,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', uc.id);

            await awardXPWithClient(
                supabase,
                userId,
                'challenge_completed',
                uc.challenge_id,
                `Completed challenge: ${challenge.challenge_type}`
            );
        } else {
            await supabase
                .from('user_challenges')
                .update({ current_value: newValue })
                .eq('id', uc.id);
        }
    }
}

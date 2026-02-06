import { createServerClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications/service';
import type { SupabaseClient } from '@supabase/supabase-js';

export type GamificationEvent =
    | 'lesson_completed'
    | 'quiz_completed'
    | 'streak_bonus'
    | 'review_written'
    | 'referral'
    | 'challenge_completed'
    | 'badge_earned'
    | 'daily_login'
    | 'system'
    | 'lesson_delivered'
    | 'student_review_received'
    | 'tutor_milestone';

export const XP_VALUES: Record<string, { xp: number, coins: number }> = {
    lesson_completed: { xp: 50, coins: 10 },
    quiz_completed: { xp: 20, coins: 5 },
    streak_bonus: { xp: 10, coins: 2 },
    review_written: { xp: 15, coins: 3 },
    referral: { xp: 200, coins: 50 },
    daily_login: { xp: 5, coins: 1 },
    badge_earned: { xp: 25, coins: 5 },
    lesson_delivered: { xp: 30, coins: 5 },
    student_review_received: { xp: 10, coins: 2 },
    tutor_milestone: { xp: 100, coins: 20 },
};

/**
 * Award XP using a provided Supabase client (for API routes / service-role contexts).
 */
export async function awardXPWithClient(
    supabase: SupabaseClient,
    userId: string,
    event: GamificationEvent,
    referenceId?: string,
    description?: string
) {
    const reward = XP_VALUES[event] || { xp: 0, coins: 0 };

    if (reward.xp === 0 && reward.coins === 0) return { success: true, xpEarned: 0, coinsEarned: 0 };

    try {
        const finalDescription = description || `Awarded for ${event.replace('_', ' ')}`;
        await supabase.from('xp_transactions').insert({
            user_id: userId,
            event_type: event,
            xp_amount: reward.xp,
            coins_amount: reward.coins,
            reference_id: referenceId,
            description: finalDescription
        });

        const { data: currentXp } = await supabase
            .from('user_xp')
            .select('total_xp, coins')
            .eq('id', userId)
            .single();

        const newTotalXp = (currentXp?.total_xp || 0) + reward.xp;
        const newCoins = (currentXp?.coins || 0) + reward.coins;

        await supabase
            .from('user_xp')
            .update({
                total_xp: newTotalXp,
                coins: newCoins,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        // Notification — best-effort, don't block on failure
        try {
            await sendNotification({
                userId,
                title: `+${reward.xp} XP Earned!`,
                message: finalDescription,
                type: event === 'badge_earned' ? 'badge_earned' : 'xp_milestone'
            });
        } catch {
            // notifications use cookie-based client; may fail in service-role context
        }

        return { success: true, xpEarned: reward.xp, coinsEarned: reward.coins };
    } catch (error) {
        console.error('Error awarding XP:', error);
        return { success: false, xpEarned: 0, coinsEarned: 0, error };
    }
}

/**
 * Award XP using cookie-based server client (for server components / server actions).
 */
export async function awardXP(userId: string, event: GamificationEvent, referenceId?: string, description?: string) {
    const supabase = await createServerClient();
    return awardXPWithClient(supabase, userId, event, referenceId, description);
}

/**
 * Update streak using a provided Supabase client.
 */
export async function updateStreakWithClient(supabase: SupabaseClient, userId: string) {
    const today = new Date().toISOString().split('T')[0];

    try {
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('id', userId)
            .single();

        if (!streak) {
            await supabase.from('user_streaks').insert({
                id: userId,
                current_streak: 1,
                longest_streak: 1,
                last_activity_date: today
            });
            return { success: true, newStreak: 1 };
        }

        const lastDate = streak.last_activity_date;

        if (lastDate === today) {
            return { success: true, newStreak: streak.current_streak, alreadyUpdatedToday: true };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = 1;
        if (lastDate === yesterdayStr) {
            newStreak = streak.current_streak + 1;
        } else {
            newStreak = 1;
        }

        const newLongestStreak = Math.max(newStreak, streak.longest_streak);

        await supabase
            .from('user_streaks')
            .update({
                current_streak: newStreak,
                longest_streak: newLongestStreak,
                last_activity_date: today,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (newStreak % 7 === 0) {
            await awardXPWithClient(supabase, userId, 'streak_bonus', undefined, `${newStreak} day streak milestone!`);
        }

        return { success: true, newStreak };
    } catch (error) {
        console.error('Error updating streak:', error);
        return { success: false, error };
    }
}

/**
 * Update streak using cookie-based server client.
 */
export async function updateStreak(userId: string) {
    const supabase = await createServerClient();
    return updateStreakWithClient(supabase, userId);
}

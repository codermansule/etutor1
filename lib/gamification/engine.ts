import { createServerClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications/service';

export type GamificationEvent =
    | 'lesson_completed'
    | 'quiz_completed'
    | 'streak_bonus'
    | 'review_written'
    | 'referral'
    | 'challenge_completed'
    | 'badge_earned'
    | 'daily_login'
    | 'system';

export const XP_VALUES: Record<string, { xp: number, coins: number }> = {
    lesson_completed: { xp: 50, coins: 10 },
    quiz_completed: { xp: 20, coins: 5 },
    streak_bonus: { xp: 10, coins: 2 },
    review_written: { xp: 15, coins: 3 },
    referral: { xp: 200, coins: 50 },
    daily_login: { xp: 5, coins: 1 },
    badge_earned: { xp: 25, coins: 5 },
};

export async function awardXP(userId: string, event: GamificationEvent, referenceId?: string, description?: string) {
    const supabase = await createServerClient();
    const reward = XP_VALUES[event] || { xp: 0, coins: 0 };

    if (reward.xp === 0 && reward.coins === 0) return;

    try {
        // 1. Log the transaction
        const finalDescription = description || `Awarded for ${event.replace('_', ' ')}`;
        await supabase.from('xp_transactions').insert({
            user_id: userId,
            event_type: event,
            xp_amount: reward.xp,
            coins_amount: reward.coins,
            reference_id: referenceId,
            description: finalDescription
        });

        // 2. Update user_xp table
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

        // 3. Send notification
        await sendNotification({
            userId,
            title: `+${reward.xp} XP Earned!`,
            message: finalDescription,
            type: event === 'badge_earned' ? 'badge_earned' : 'xp_milestone'
        });

        return { success: true, xpEarned: reward.xp, coinsEarned: reward.coins };
    } catch (error) {
        console.error('Error awarding XP:', error);
        return { success: false, error };
    }
}

export async function updateStreak(userId: string) {
    const supabase = await createServerClient();
    const today = new Date().toISOString().split('T')[0];

    try {
        const { data: streak } = await supabase
            .from('user_streaks')
            .select('*')
            .eq('id', userId)
            .single();

        if (!streak) {
            // Initialize streak
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
            // Streak broken, but check for freezes if we implement that later
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

        // If new streak milestone, award bonus XP
        if (newStreak % 7 === 0) {
            await awardXP(userId, 'streak_bonus', undefined, `${newStreak} day streak milestone!`);
        }

        return { success: true, newStreak };
    } catch (error) {
        console.error('Error updating streak:', error);
        return { success: false, error };
    }
}

import { createServerClient } from '@/lib/supabase/server';
import { awardXPWithClient } from './engine';
import type { SupabaseClient } from '@supabase/supabase-js';

interface BadgeCriteria {
    badge_id: string;
    check: (stats: UserStats) => boolean;
}

interface UserStats {
    lessonsCompleted: number;
    reviewsWritten: number;
    currentStreak: number;
    longestStreak: number;
    currentLevel: number;
    quizzesCompleted: number;
    lessonsDelivered: number;
    reviewsReceived: number;
    avgRating: number;
}

/**
 * Badge criteria mapped to badge names stored in the `badges` table.
 * The badge_id here matches the `name` column — we resolve the actual UUID at runtime.
 */
const BADGE_CRITERIA: BadgeCriteria[] = [
    { badge_id: 'First Step', check: (s) => s.lessonsCompleted >= 1 },
    { badge_id: 'Quick Learner', check: (s) => s.lessonsCompleted >= 5 },
    { badge_id: 'Dedicated Learner', check: (s) => s.lessonsCompleted >= 25 },
    { badge_id: 'Knowledge Master', check: (s) => s.lessonsCompleted >= 100 },
    { badge_id: 'Social Butterfly', check: (s) => s.reviewsWritten >= 5 },
    { badge_id: 'Week on Fire', check: (s) => s.longestStreak >= 7 },
    { badge_id: 'Persistence Pays', check: (s) => s.longestStreak >= 30 },
    { badge_id: 'Zenith', check: (s) => s.currentLevel >= 10 },
    { badge_id: 'First Lesson Taught', check: (s) => s.lessonsDelivered >= 1 },
    { badge_id: 'Popular Tutor', check: (s) => s.reviewsReceived >= 10 },
    { badge_id: 'Star Tutor', check: (s) => s.avgRating >= 4.5 && s.reviewsReceived >= 3 },
    { badge_id: 'Veteran', check: (s) => s.lessonsDelivered >= 50 },
];

/**
 * Check and award any newly-earned badges for a user.
 * Accepts an optional supabase client for service-role contexts.
 */
export async function checkBadges(userId: string, client?: SupabaseClient) {
    const supabase = client || await createServerClient();

    try {
        // Gather user stats in parallel
        const [lessonsRes, reviewsRes, streakRes, xpRes, quizzesRes, sessionsRes, tutorReviewsRes] = await Promise.all([
            supabase
                .from('bookings')
                .select('id', { count: 'exact', head: true })
                .eq('student_id', userId)
                .eq('status', 'completed'),
            supabase
                .from('reviews')
                .select('id', { count: 'exact', head: true })
                .eq('student_id', userId),
            supabase
                .from('user_streaks')
                .select('current_streak, longest_streak')
                .eq('id', userId)
                .single(),
            supabase
                .from('user_xp')
                .select('current_level')
                .eq('id', userId)
                .single(),
            supabase
                .from('ai_quiz_attempts')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId),
            supabase
                .from('sessions')
                .select('id', { count: 'exact', head: true })
                .eq('tutor_id', userId)
                .eq('status', 'ended'),
            supabase
                .from('reviews')
                .select('rating')
                .eq('tutor_id', userId),
        ]);

        const stats: UserStats = {
            lessonsCompleted: lessonsRes.count ?? 0,
            reviewsWritten: reviewsRes.count ?? 0,
            currentStreak: streakRes.data?.current_streak ?? 0,
            longestStreak: streakRes.data?.longest_streak ?? 0,
            currentLevel: xpRes.data?.current_level ?? 1,
            quizzesCompleted: quizzesRes.count ?? 0,
            lessonsDelivered: sessionsRes.count ?? 0,
            reviewsReceived: tutorReviewsRes.data?.length ?? 0,
            avgRating: tutorReviewsRes.data?.length ? tutorReviewsRes.data.reduce((sum: number, r: any) => sum + r.rating, 0) / tutorReviewsRes.data.length : 0,
        };

        // Fetch all badges and user's already-earned badges
        const [allBadgesRes, earnedBadgesRes] = await Promise.all([
            supabase.from('badges').select('id, name'),
            supabase.from('user_badges').select('badge_id').eq('user_id', userId),
        ]);

        const allBadges = allBadgesRes.data ?? [];
        const earnedBadgeIds = new Set((earnedBadgesRes.data ?? []).map((b) => b.badge_id));

        // Build name→id map
        const badgeNameToId = new Map<string, string>();
        for (const b of allBadges) {
            badgeNameToId.set(b.name, b.id);
        }

        let newBadgesAwarded = 0;

        for (const criteria of BADGE_CRITERIA) {
            const badgeDbId = badgeNameToId.get(criteria.badge_id);
            if (!badgeDbId) continue; // badge not in DB yet
            if (earnedBadgeIds.has(badgeDbId)) continue; // already earned

            if (criteria.check(stats)) {
                await supabase.from('user_badges').insert({
                    user_id: userId,
                    badge_id: badgeDbId,
                });

                // Award bonus XP for earning a badge
                await awardXPWithClient(supabase, userId, 'badge_earned', badgeDbId, `Earned badge: ${criteria.badge_id}`);
                newBadgesAwarded++;
            }
        }

        return { success: true, newBadgesAwarded };
    } catch (error) {
        console.error('Error checking badges:', error);
        return { success: false, error };
    }
}

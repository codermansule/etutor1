import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { awardXPWithClient } from '@/lib/gamification/engine';
import { updateStreakWithClient } from '@/lib/gamification/engine';
import { checkBadges } from '@/lib/gamification/badges';
import { captureError } from '@/lib/monitoring/sentry';

/**
 * GET /api/referrals — Get current user's referral code and stats
 */
export async function GET() {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [profileRes, referralsRes] = await Promise.all([
            supabase
                .from('profiles')
                .select('referral_code')
                .eq('id', user.id)
                .single(),
            supabase
                .from('referrals')
                .select('id, status, referred_user_id, created_at, completed_at')
                .eq('referrer_id', user.id)
                .order('created_at', { ascending: false }),
        ]);

        const completedCount = (referralsRes.data ?? []).filter(
            (r) => r.status === 'completed'
        ).length;

        return NextResponse.json({
            referralCode: profileRes.data?.referral_code ?? null,
            referrals: referralsRes.data ?? [],
            completedCount,
            totalXpEarned: completedCount * 200, // 200 XP per referral
        });
    } catch (error) {
        captureError(error, { route: 'GET /api/referrals' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/referrals — Complete a referral (called after a referred user signs up)
 * Body: { referralCode: string }
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { referralCode } = await req.json();

        if (!referralCode) {
            return NextResponse.json({ error: 'Missing referral code' }, { status: 400 });
        }

        // Find the referrer by code
        const { data: referrer } = await supabase
            .from('profiles')
            .select('id, referral_code')
            .eq('referral_code', referralCode.toUpperCase())
            .single();

        if (!referrer) {
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        // Can't refer yourself
        if (referrer.id === user.id) {
            return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
        }

        // Check if this user was already referred
        const { data: existingReferral } = await supabase
            .from('referrals')
            .select('id')
            .eq('referred_user_id', user.id)
            .maybeSingle();

        if (existingReferral) {
            return NextResponse.json({ error: 'Already referred' }, { status: 409 });
        }

        // Create the referral record
        await supabase.from('referrals').insert({
            referrer_id: referrer.id,
            referral_code: referralCode.toUpperCase(),
            referred_user_id: user.id,
            status: 'completed',
            completed_at: new Date().toISOString(),
        });

        // Award XP to the referrer
        await awardXPWithClient(
            supabase,
            referrer.id,
            'referral',
            user.id,
            `Referral completed: new user signed up`
        );

        // Also give the new user a small bonus
        await awardXPWithClient(
            supabase,
            user.id,
            'daily_login', // Use daily_login as a small welcome bonus
            referrer.id,
            'Welcome bonus for using a referral code'
        );

        await Promise.all([
            updateStreakWithClient(supabase, referrer.id),
            checkBadges(referrer.id, supabase),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        captureError(error, { route: 'POST /api/referrals' });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { captureError } from '@/lib/monitoring/sentry';

export async function POST(req: Request) {
  try {
    const { rewardId } = await req.json();
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get reward details
    const { data: reward } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single();

    if (!reward) return NextResponse.json({ error: 'Reward not found' }, { status: 404 });

    // Check stock
    if (reward.stock !== null && reward.stock <= 0) {
      return NextResponse.json({ error: 'Out of stock' }, { status: 400 });
    }

    // Check user coins
    const { data: userXp } = await supabase
      .from('user_xp')
      .select('coins')
      .eq('id', user.id)
      .single();

    const userCoins = userXp?.coins || 0;
    if (userCoins < reward.coin_cost) {
      return NextResponse.json({ error: 'Not enough coins' }, { status: 400 });
    }

    // Deduct coins
    await supabase
      .from('user_xp')
      .update({ coins: userCoins - reward.coin_cost, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    // Insert user_reward
    const { data: userReward, error: insertError } = await supabase
      .from('user_rewards')
      .insert({
        user_id: user.id,
        reward_id: rewardId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Decrement stock if applicable
    if (reward.stock !== null) {
      await supabase
        .from('rewards')
        .update({ stock: reward.stock - 1 })
        .eq('id', rewardId);
    }

    return NextResponse.json({ success: true, userReward, coinsRemaining: userCoins - reward.coin_cost });
  } catch (error) {
    captureError(error, { route: 'POST /api/rewards/redeem' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

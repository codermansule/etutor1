import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RewardsPageClient from './RewardsPageClient';

export default async function RewardsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [rewardsRes, xpRes, userRewardsRes] = await Promise.all([
    supabase.from('rewards').select('*').eq('is_active', true).order('coin_cost'),
    supabase.from('user_xp').select('coins').eq('id', user.id).single(),
    supabase.from('user_rewards').select('*, rewards(name, reward_type, description)').eq('user_id', user.id).order('redeemed_at', { ascending: false }),
  ]);

  return (
    <RewardsPageClient
      rewards={rewardsRes.data ?? []}
      userCoins={xpRes.data?.coins ?? 0}
      userRewards={userRewardsRes.data ?? []}
    />
  );
}

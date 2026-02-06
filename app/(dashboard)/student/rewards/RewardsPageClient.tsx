'use client';

import { useState } from 'react';
import { Coins, Gift, ShoppingBag } from 'lucide-react';
import RewardCard from '@/components/features/gamification/RewardCard';
import { Card } from '@/components/ui/card';

interface RewardsPageClientProps {
  rewards: any[];
  userCoins: number;
  userRewards: any[];
}

export default function RewardsPageClient({ rewards, userCoins: initialCoins, userRewards }: RewardsPageClientProps) {
  const [coins, setCoins] = useState(initialCoins);
  const [myRewards, setMyRewards] = useState(userRewards);

  const handleRedeem = async (rewardId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to redeem');
        return false;
      }
      setCoins(data.coinsRemaining);
      setMyRewards(prev => [data.userReward, ...prev]);
      return true;
    } catch {
      alert('Network error');
      return false;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-white">Rewards Store</h1>
          <p className="text-sm text-slate-400 mt-1">Spend your hard-earned coins on exclusive rewards.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Coins className="h-6 w-6 text-amber-400" />
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Your Coins</p>
            <p className="text-2xl font-black text-amber-400">{coins.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            userCoins={coins}
            onRedeem={handleRedeem}
          />
        ))}
      </div>

      {myRewards.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-sky-400" />
            My Rewards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myRewards.map((ur: any) => (
              <Card key={ur.id} className="bg-slate-900/50 border-white/5 p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                  <Gift className="h-5 w-5 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{ur.rewards?.name || 'Reward'}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {ur.used ? 'Used' : 'Available'} &middot; {new Date(ur.redeemed_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

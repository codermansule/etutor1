'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Loader2, Check, Gift, Palette, Frame, Snowflake, Tag, BookOpen } from 'lucide-react';

interface RewardCardProps {
  reward: {
    id: string;
    name: string;
    description: string;
    reward_type: string;
    coin_cost: number;
    stock: number | null;
  };
  userCoins: number;
  onRedeem: (rewardId: string) => Promise<boolean>;
}

const TYPE_ICONS: Record<string, typeof Gift> = {
  discount: Tag,
  free_lesson: BookOpen,
  profile_theme: Palette,
  profile_frame: Frame,
  streak_freeze: Snowflake,
  badge: Gift,
};

const TYPE_COLORS: Record<string, string> = {
  discount: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
  free_lesson: 'from-sky-500/20 to-sky-600/10 border-sky-500/20',
  profile_theme: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
  profile_frame: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
  streak_freeze: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20',
  badge: 'from-pink-500/20 to-pink-600/10 border-pink-500/20',
};

export default function RewardCard({ reward, userCoins, onRedeem }: RewardCardProps) {
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const canAfford = userCoins >= reward.coin_cost;
  const inStock = reward.stock === null || reward.stock > 0;
  const Icon = TYPE_ICONS[reward.reward_type] || Gift;
  const colorClass = TYPE_COLORS[reward.reward_type] || TYPE_COLORS.badge;

  const handleRedeem = async () => {
    setLoading(true);
    try {
      const success = await onRedeem(reward.id);
      if (success) setRedeemed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${colorClass} p-6 flex flex-col gap-4`}>
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur">
          <Coins className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-sm font-black text-amber-400">{reward.coin_cost}</span>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-white">{reward.name}</h3>
        <p className="text-xs text-white/60 mt-1">{reward.description}</p>
      </div>

      {reward.stock !== null && (
        <p className="text-[10px] uppercase tracking-widest font-bold text-white/40">
          {reward.stock} remaining
        </p>
      )}

      <Button
        onClick={handleRedeem}
        disabled={loading || redeemed || !canAfford || !inStock}
        className={`w-full font-bold uppercase tracking-wider ${
          redeemed
            ? 'bg-emerald-500 text-white'
            : canAfford && inStock
            ? 'bg-white text-slate-950 hover:bg-white/90'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : redeemed ? (
          <><Check className="h-4 w-4 mr-2" /> Redeemed</>
        ) : !canAfford ? (
          'Not Enough Coins'
        ) : !inStock ? (
          'Out of Stock'
        ) : (
          'Redeem'
        )}
      </Button>
    </Card>
  );
}

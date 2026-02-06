import { createServerClient } from "@/lib/supabase/server";
import { Gift, Copy, Users, Zap } from "lucide-react";
import ReferralSection from "@/components/features/referrals/ReferralSection";

export default async function StudentSettingsPage() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? '';

    const [profileRes, referralsRes] = await Promise.all([
        supabase.from('profiles').select('full_name, email, referral_code').eq('id', userId).single(),
        supabase
            .from('referrals')
            .select('id, status, created_at, completed_at')
            .eq('referrer_id', userId)
            .order('created_at', { ascending: false }),
    ]);

    const profile = profileRes.data;
    const referralCode = profile?.referral_code ?? '';
    const referrals = referralsRes.data ?? [];
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;

    return (
        <div className="space-y-12 max-w-3xl">
            <div className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-white">Settings</h1>
                <p className="text-sm text-slate-400 italic">Manage your account and referrals.</p>
            </div>

            {/* Profile Info */}
            <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-8 space-y-4">
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Name</p>
                        <p className="text-white font-medium">{profile?.full_name ?? 'Not set'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email</p>
                        <p className="text-white font-medium">{profile?.email ?? user?.email ?? 'Not set'}</p>
                    </div>
                </div>
            </div>

            {/* Referral Section */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-600/10 to-indigo-600/10 p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-sky-400" />
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Refer a Friend</h2>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                    Share your referral code with friends. When they sign up and use your code, you earn <span className="text-sky-400 font-bold">200 XP + 50 coins</span>!
                </p>

                <ReferralSection referralCode={referralCode} />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-emerald-400" />
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Friends Referred</p>
                            <p className="text-lg font-black text-white">{completedReferrals}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Zap className="h-4 w-4 text-sky-400" />
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">XP Earned</p>
                            <p className="text-lg font-black text-white">{completedReferrals * 200}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

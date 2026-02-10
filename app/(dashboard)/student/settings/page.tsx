import { createServerClient } from "@/lib/supabase/server";
import { Gift, Users, Zap } from "lucide-react";
import ReferralSection from "@/components/features/referrals/ReferralSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";
import AvatarUpload from "@/components/features/settings/AvatarUpload";

export const metadata: Metadata = {
    title: "Student Settings | ETUTOR",
};

export async function updateStudentSettings(formData: FormData) {
    "use server";
    const supabase = await createServerClient();
    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
        throw new Error("You must be logged in to update settings.");
    }

    const fullName = formData.get("fullName")?.toString().trim();
    const timezone = formData.get("timezone")?.toString().trim();
    const preferredLanguage = formData.get("preferredLanguage")?.toString().trim();
    const bio = formData.get("bio")?.toString().trim();

    const updates: Record<string, string | null> = {};
    if (fullName) updates.full_name = fullName;
    if (timezone) updates.timezone = timezone;
    if (preferredLanguage) updates.preferred_language = preferredLanguage;
    if (bio !== undefined) updates.bio = bio;

    await supabase.from("profiles").update(updates).eq("id", user.id);
    revalidatePath("/dashboard/student/settings");
}

export default async function StudentSettingsPage() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";

    const [profileRes, referralsRes] = await Promise.all([
        supabase.from("profiles").select("full_name, email, referral_code, timezone, preferred_language, bio, avatar_url").eq("id", userId).single(),
        supabase
            .from("referrals")
            .select("id, status, created_at, completed_at")
            .eq("referrer_id", userId)
            .order("created_at", { ascending: false }),
    ]);

    const profile = profileRes.data;
    const referralCode = profile?.referral_code ?? "";
    const referrals = referralsRes.data ?? [];
    const completedReferrals = referrals.filter((r) => r.status === "completed").length;

    return (
        <div className="space-y-12 max-w-4xl">
            <div className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-white">Settings</h1>
                <p className="text-sm text-slate-400 italic">Manage your account preferences and referrals.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-8 space-y-6">
                <AvatarUpload userId={userId} currentAvatarUrl={profile?.avatar_url} />
            </div>

            <form action={updateStudentSettings} className="rounded-3xl border border-white/10 bg-slate-900/30 p-8 space-y-6">
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Profile Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Full Name</p>
                        <Input
                            name="fullName"
                            defaultValue={profile?.full_name ?? ""}
                            placeholder="Your full name"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email</p>
                        <Input
                            readOnly
                            value={profile?.email ?? user?.email ?? ""}
                            className="bg-slate-950/80"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Timezone</p>
                        <Input
                            name="timezone"
                            defaultValue={profile?.timezone ?? "UTC"}
                            placeholder="UTC"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Preferred Language</p>
                        <Input
                            name="preferredLanguage"
                            defaultValue={profile?.preferred_language ?? "en"}
                            placeholder="en"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bio</p>
                    <Textarea
                        name="bio"
                        defaultValue={profile?.bio ?? ""}
                        placeholder="Tell us a bit about yourself"
                    />
                </div>
                <Button type="submit">Save Settings</Button>
            </form>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-600/10 to-indigo-600/10 p-8 space-y-6">
                <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-sky-400" />
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Refer a Friend</h2>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                    Share your referral code with friends. When they sign up and use your code, you earn{" "}
                    <span className="text-sky-400 font-bold">200 XP + 50 coins</span>!
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

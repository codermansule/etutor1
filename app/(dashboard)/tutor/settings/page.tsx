import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tutor Settings | ETUTOR",
};

export async function updateTutorSettings(formData: FormData) {
    "use server";
    const supabase = await createServerClient();
    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
        throw new Error("Authentication required to update tutor settings.");
    }

    const fullName = formData.get("fullName")?.toString().trim();
    const timezone = formData.get("timezone")?.toString().trim();
    const preferredLanguage = formData.get("preferredLanguage")?.toString().trim();
    const headline = formData.get("headline")?.toString().trim();
    const about = formData.get("about")?.toString().trim();
    const introVideoUrl = formData.get("introVideoUrl")?.toString().trim();
    const hourlyRateRaw = formData.get("hourlyRate")?.toString().trim();
    const trialRateRaw = formData.get("trialRate")?.toString().trim();
    const currency = formData.get("currency")?.toString().trim() || "USD";

    const parseRate = (value?: string | null) => {
        if (!value) return null;
        const parsed = Number(value.replace(/,/g, ""));
        return Number.isFinite(parsed) ? parsed : null;
    };

    const hourlyRate = parseRate(hourlyRateRaw);
    const trialRate = parseRate(trialRateRaw);

    const profileUpdates: Record<string, string> = {};
    if (fullName) profileUpdates.full_name = fullName;
    if (timezone) profileUpdates.timezone = timezone;
    if (preferredLanguage) profileUpdates.preferred_language = preferredLanguage;

    if (Object.keys(profileUpdates).length > 0) {
        await supabase.from("profiles").update(profileUpdates).eq("id", user.id);
    }

    const tutorUpdates: Record<string, string | number> = {};
    if (headline) tutorUpdates.headline = headline;
    if (about !== undefined) tutorUpdates.about = about;
    if (hourlyRate !== null) tutorUpdates.hourly_rate = hourlyRate;
    if (trialRate !== null) tutorUpdates.trial_rate = trialRate;
    if (currency) tutorUpdates.currency = currency;
    if (introVideoUrl !== undefined) tutorUpdates.intro_video_url = introVideoUrl;

    if (Object.keys(tutorUpdates).length > 0) {
        await supabase.from("tutor_profiles").update(tutorUpdates).eq("id", user.id);
    }

    revalidatePath("/dashboard/tutor/settings");
}

export default async function TutorSettingsPage() {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? "";
    const [profileRes, tutorRes] = await Promise.all([
        supabase.from("profiles").select("full_name, email, timezone, preferred_language").eq("id", userId).single(),
        supabase
            .from("tutor_profiles")
            .select("headline, about, hourly_rate, trial_rate, currency, intro_video_url")
            .eq("id", userId)
            .single(),
    ]);

    const profile = profileRes.data;
    const tutorProfile = tutorRes.data;

    return (
        <div className="space-y-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-white">Tutor Settings</h1>
                <p className="text-sm text-slate-400 italic">
                    Update your profile, pricing, and intro video for students.
                </p>
            </div>

            <form action={updateTutorSettings} className="grid gap-6 rounded-3xl border border-white/10 bg-slate-900/30 p-8 lg:grid-cols-2">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Full Name</p>
                        <Input name="fullName" defaultValue={profile?.full_name ?? ""} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Headline</p>
                        <Input name="headline" defaultValue={tutorProfile?.headline ?? ""} placeholder="Expert Geography tutor" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hourly Rate</p>
                        <Input
                            name="hourlyRate"
                            defaultValue={tutorProfile?.hourly_rate?.toString() ?? ""}
                            placeholder="e.g. 45.00"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Trial Rate</p>
                        <Input
                            name="trialRate"
                            defaultValue={tutorProfile?.trial_rate?.toString() ?? ""}
                            placeholder="optional trial pricing"
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Currency</p>
                        <Input name="currency" defaultValue={tutorProfile?.currency ?? "USD"} />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Timezone</p>
                        <Input name="timezone" defaultValue={profile?.timezone ?? "UTC"} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Preferred Language</p>
                        <Input name="preferredLanguage" defaultValue={profile?.preferred_language ?? "en"} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Intro Video URL</p>
                        <Input
                            name="introVideoUrl"
                            defaultValue={tutorProfile?.intro_video_url ?? ""}
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">About</p>
                        <Textarea
                            name="about"
                            defaultValue={tutorProfile?.about ?? ""}
                            placeholder="Describe your teaching style..."
                        />
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <Button type="submit">Save Profile</Button>
                </div>
            </form>

            {tutorProfile?.intro_video_url && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">Video Preview</h2>
                    <p className="text-xs text-slate-400 mb-4">Students will see this video on your public profile.</p>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        {tutorProfile.intro_video_url.endsWith(".mp4") ? (
                            <video
                                className="w-full rounded-xl"
                                src={tutorProfile.intro_video_url}
                                controls
                            />
                        ) : (
                            <a
                                href={tutorProfile.intro_video_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 underline"
                            >
                                Open intro video
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

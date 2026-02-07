import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/text-area";
import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Settings | ETUTOR",
};

export async function updateAdminSettings(formData: FormData) {
    "use server";
    const supabase = await createServerClient();
    const {
        data: { user },
        error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
        throw new Error("Authentication required to update admin settings.");
    }

    const fullName = formData.get("fullName")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const timezone = formData.get("timezone")?.toString().trim();
    const preferredLanguage = formData.get("preferredLanguage")?.toString().trim();
    const bio = formData.get("bio")?.toString().trim();

    const updates: Record<string, string | null> = {};
    if (fullName) updates.full_name = fullName;
    if (phone) updates.phone = phone;
    if (timezone) updates.timezone = timezone;
    if (preferredLanguage) updates.preferred_language = preferredLanguage;
    if (bio !== undefined) updates.bio = bio;

    await supabase.from("profiles").update(updates).eq("id", user.id);
    revalidatePath("/dashboard/admin/settings");
}

export default async function AdminSettingsPage() {
    const supabase = await createServerClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id ?? "";

    const [
        profileRes,
        bookingsRes,
        studentsRes,
        tutorsRes,
        pendingTutorsRes,
    ] = await Promise.all([
        supabase
            .from("profiles")
            .select("full_name, email, phone, timezone, preferred_language, bio")
            .eq("id", userId)
            .single(),
        supabase.from("bookings").select("id", { head: true, count: "exact" }),
        supabase
            .from("profiles")
            .select("id", { head: true, count: "exact" })
            .eq("role", "student"),
        supabase
            .from("profiles")
            .select("id", { head: true, count: "exact" })
            .eq("role", "tutor"),
        supabase
            .from("tutor_profiles")
            .select("id", { head: true, count: "exact" })
            .eq("approval_status", "pending"),
    ]);

    const profile = profileRes.data;

    return (
        <div className="space-y-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-white">Admin Settings</h1>
                <p className="text-sm text-slate-400 italic">
                    Manage your admin profile and monitor platform health.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bookings</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{bookingsRes.count ?? 0}</p>
                    <p className="text-xs text-slate-500">total scheduled lessons</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Students</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{studentsRes.count ?? 0}</p>
                    <p className="text-xs text-slate-500">enrolled users</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tutors</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{tutorsRes.count ?? 0}</p>
                    <p className="text-xs text-slate-500">active tutors</p>
                </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/30 p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">Profile</h2>
                        <p className="text-xs text-slate-400">Update your contact info and admin bio.</p>
                    </div>
                    <div className="text-xs text-slate-400">
                        Pending tutor approvals: {pendingTutorsRes.count ?? 0}
                    </div>
                </div>

                <form action={updateAdminSettings} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Full Name</p>
                            <Input name="fullName" defaultValue={profile?.full_name ?? ""} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Email</p>
                            <Input readOnly value={profile?.email ?? user?.email ?? ""} className="bg-slate-950/80" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Phone</p>
                            <Input name="phone" defaultValue={profile?.phone ?? ""} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Timezone</p>
                            <Input name="timezone" defaultValue={profile?.timezone ?? "UTC"} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Language</p>
                            <Input name="preferredLanguage" defaultValue={profile?.preferred_language ?? "en"} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bio</p>
                        <Textarea name="bio" defaultValue={profile?.bio ?? ""} />
                    </div>

                    <Button type="submit">Save Admin Profile</Button>
                </form>
            </div>
        </div>
    );
}

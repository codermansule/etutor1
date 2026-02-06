"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ChevronLeft, Loader2, Sparkles, BookOpen, Clock, User, Plus, Trash2, MapPin } from "lucide-react";

type Subject = {
    id: string;
    name: string;
    category: string;
};

type AvailabilitySlot = {
    day_of_week: number | null;
    specific_date: string | null;
    start_time: string;
    end_time: string;
    timezone: string;
};

const DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export default function TutorOnboarding() {
    const router = useRouter();
    const supabase = createBrowserClient();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fetchingSubjects, setFetchingSubjects] = useState(true);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    // Form State
    const [profile, setProfile] = useState({
        headline: "",
        about: "",
        hourly_rate: "25",
    });
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
    const [timezone, setTimezone] = useState("UTC");
    const [weeklySelection, setWeeklySelection] = useState(0);
    const [overrideDate, setOverrideDate] = useState(() => new Date().toISOString().split("T")[0]);

    useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
            setTimezone(tz);
        }
    }, []);

    useEffect(() => {
        async function loadSubjects() {
            const { data, error } = await supabase
                .from("subjects")
                .select("id, name, category")
                .order("category", { ascending: true })
                .order("name", { ascending: true });

            if (!error && data) {
                setSubjects(data);
            }
            setFetchingSubjects(false);
        }
        loadSubjects();
    }, [supabase]);

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
    };

    const toggleSubject = (id: string) => {
        setSelectedSubjects(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const handleOnboardingComplete = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user");

            // 1. Create/Update Tutor Profile
            const { error: profileErr } = await supabase
                .from("tutor_profiles")
                .upsert({
                    id: user.id,
                    headline: profile.headline,
                    about: profile.about,
                    hourly_rate: parseFloat(profile.hourly_rate),
                    is_approved: false, // Placeholder approval
                });

            if (profileErr) throw profileErr;

            // 2. Add Tutor Subjects
            if (selectedSubjects.length > 0) {
                const subjectData = selectedSubjects.map(sid => ({
                    tutor_id: user.id,
                    subject_id: sid,
                    proficiency_level: "advanced"
                }));

                const { error: subErr } = await supabase
                    .from("tutor_subjects")
                    .insert(subjectData);

                if (subErr) throw subErr;
            }

            // 3. Set onboarding_completed = true
            const { error: updateErr } = await supabase
                .from("profiles")
                .update({ onboarding_completed: true })
                .eq("id", user.id);

            if (updateErr) throw updateErr;

            // 4. Persist availability
            await supabase.from("availability").delete().eq("tutor_id", user.id);
            if (availabilitySlots.length > 0) {
                const availabilityData = availabilitySlots
                    .filter(slot => slot.day_of_week !== null || slot.specific_date)
                    .map(slot => ({
                        tutor_id: user.id,
                        day_of_week: slot.day_of_week,
                        specific_date: slot.specific_date,
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                        timezone: slot.timezone,
                    }));

                if (availabilityData.length > 0) {
                    const { error: availErr } = await supabase
                        .from("availability")
                        .insert(availabilityData);

                    if (availErr) throw availErr;
                }
            }

            router.push("/tutor");
        } catch (err) {
            console.error("Onboarding error:", err);
            alert("Failed to complete onboarding. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const addWeeklySlot = (dayIndex: number) => {
        setAvailabilitySlots(prev => [
            ...prev,
            {
                day_of_week: dayIndex,
                specific_date: null,
                start_time: "09:00",
                end_time: "17:00",
                timezone,
            },
        ]);
    };

    const addOverrideSlot = (date?: string) => {
        setAvailabilitySlots(prev => [
            ...prev,
            {
                day_of_week: null,
                specific_date: date ?? new Date().toISOString().split("T")[0],
                start_time: "09:00",
                end_time: "17:00",
                timezone,
            },
        ]);
    };

    const updateSlot = (index: number, updates: Partial<AvailabilitySlot>) => {
        setAvailabilitySlots(prev => {
            const next = [...prev];
            next[index] = { ...next[index], ...updates };
            return next;
        });
    };

    const removeSlot = (index: number) => {
        setAvailabilitySlots(prev => prev.filter((_, i) => i !== index));
    };

    const weeklySlots = availabilitySlots.filter(slot => slot.day_of_week !== null);
    const overrideSlots = availabilitySlots.filter(slot => slot.specific_date);

    return (
        <div className="mx-auto max-w-3xl py-12 px-4 sm:px-6 lg:px-8">
            {/* Progress Header */}
            <div className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-3xl font-black uppercase tracking-[0.4em] text-white">
                        Tutor Onboarding
                    </h1>
                    <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                        Step {step} of 3
                    </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                        className="h-full bg-gradient-to-r from-sky-500 to-cyan-400"
                        initial={{ width: "33.33%" }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Professional Profile</h2>
                                    <p className="text-sm text-slate-400">Tell students about your expertise and style.</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="headline">Professional Headline</Label>
                                    <Input
                                        id="headline"
                                        placeholder="e.g. Certified Mathematics Tutor with 5+ years experience"
                                        value={profile.headline}
                                        onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                                        required
                                        className="bg-slate-950/50 border-white/10 focus:border-sky-500/50 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="about">About Me</Label>
                                    <textarea
                                        id="about"
                                        rows={4}
                                        placeholder="Describe your teaching philosophy and background..."
                                        value={profile.about}
                                        onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                                        required
                                        className="flex w-full rounded-md border border-white/10 bg-slate-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="rate">Hourly Rate (USD)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                        <Input
                                            id="rate"
                                            type="number"
                                            value={profile.hourly_rate}
                                            onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                                            required
                                            className="bg-slate-950/50 border-white/10 pl-7 text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" className="group bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 hover:brightness-110">
                                        Next Step
                                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Select Your Subjects</h2>
                                    <p className="text-sm text-slate-400">Which subjects are you qualified to teach?</p>
                                </div>
                            </div>

                            {fetchingSubjects ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
                                </div>
                            ) : (
                                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6">
                                    {Array.from(new Set(subjects.map(s => s.category))).map(cat => (
                                        <div key={cat} className="space-y-3">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{cat}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {subjects.filter(s => s.category === cat).map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        onClick={() => toggleSubject(sub.id)}
                                                        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${selectedSubjects.includes(sub.id)
                                                                ? "bg-sky-500 text-slate-950"
                                                                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                                            }`}
                                                    >
                                                        {sub.name}
                                                        {selectedSubjects.includes(sub.id) && <Check className="h-3 w-3" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-8 flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="border-white/10 text-white hover:bg-white/5"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    onClick={() => setStep(3)}
                                    disabled={selectedSubjects.length === 0}
                                    className="group bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 hover:brightness-110 disabled:opacity-50"
                                >
                                    Next Step
                                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Availability Note</h2>
                                    <p className="text-sm text-slate-400">Complete your profile to start receiving bookings.</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 text-sky-400">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 font-bold text-white">Almost Ready!</h3>
                                <p className="text-sm text-slate-400">
                                    By completing onboarding, your profile will be submitted for verification.
                                    You can set detailed weekly availability in your dashboard after completion.
                                </p>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(2)}
                                    className="border-white/10 text-white hover:bg-white/5"
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleOnboardingComplete}
                                    disabled={loading}
                                    className="bg-sky-500 text-slate-950 hover:bg-sky-400 px-8"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Complete Onboarding"
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

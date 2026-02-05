import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Star, ShieldCheck, Video, Clock, Globe, MapPin, GraduationCap, Award, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function TutorProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = createServerClient();

    const { data: tutor } = await supabase
        .from("tutor_profiles")
        .select(`
      *,
      profiles:id (
        full_name,
        avatar_url,
        country,
        preferred_language
      ),
      tutor_subjects (
        subjects (
          name,
          category
        )
      )
    `)
        .eq("id", id)
        .single();

    if (!tutor) notFound();

    const subjects = tutor.tutor_subjects.map((ts: any) => ts.subjects);

    return (
        <main className="py-12">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Breadcrumb */}
                <nav className="text-sm text-slate-500">
                    <Link href="/tutors" className="hover:text-white transition-colors">Tutors</Link>
                    <span className="mx-2">/</span>
                    <span className="text-slate-300">{tutor.profiles.full_name}</span>
                </nav>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Info Card */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="rounded-3xl border border-white/10 bg-slate-900/50 p-8 backdrop-blur-xl">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                                <Avatar className="h-24 w-24 border-4 border-white/10 shadow-2xl">
                                    <AvatarImage src={tutor.profiles.avatar_url ?? ""} alt={tutor.profiles.full_name} />
                                    <AvatarFallback className="bg-sky-500/10 text-3xl font-bold text-sky-400">
                                        {tutor.profiles.full_name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-3xl font-black text-white">{tutor.profiles.full_name}</h1>
                                        {tutor.is_verified && <ShieldCheck className="h-6 w-6 text-sky-400" />}
                                    </div>
                                    <p className="text-xl text-slate-300 font-medium italic">&quot;{tutor.headline}&quot;</p>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                                            <Star className="h-4 w-4 fill-current" />
                                            {tutor.average_rating > 0 ? tutor.average_rating.toFixed(1) : "New"}
                                            <span className="font-normal text-slate-500">({tutor.rating_count} reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4" />
                                            {tutor.profiles.country ?? "Global"}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Globe className="h-4 w-4" />
                                            Speaks {tutor.profiles.preferred_language ?? "English"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <h2 className="text-xl font-bold text-white mb-4 italic uppercase tracking-widest text-sky-400/80">About Me</h2>
                                <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed">
                                    {tutor.about}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Subjects I Teach</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {subjects.map((sub: any, i: number) => (
                                            <Badge key={i} className="bg-sky-500/10 text-sky-300 border-sky-500/20 px-3 py-1">
                                                {sub.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Resume/Education placeholders */}
                        <section className="grid gap-6 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                                    <GraduationCap className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-4">Education</h3>
                                <div className="space-y-4">
                                    <div className="border-l-2 border-white/5 pl-4 py-1">
                                        <p className="font-bold text-white text-sm">Verified Degree</p>
                                        <p className="text-xs text-slate-500">Professional certification checked by SBETUTOR</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                                    <Award className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-4">Experience</h3>
                                <div className="space-y-4">
                                    <div className="border-l-2 border-white/5 pl-4 py-1">
                                        <p className="font-bold text-white text-sm">{tutor.experience_years ?? 5}+ Years Teaching</p>
                                        <p className="text-xs text-slate-500">Experience across multiple platforms</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Booking Widget */}
                    <div className="space-y-6">
                        <section className="sticky top-24 rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-3xl font-black text-white">
                                        ${tutor.hourly_rate}
                                        <span className="text-sm font-normal text-slate-500">/hr</span>
                                    </p>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Active Now</Badge>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <Video className="h-4 w-4 text-sky-400" />
                                        <span>Live 1-on-1 Lesson</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <Clock className="h-4 w-4 text-sky-400" />
                                        <span>60-minute session</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <CheckCircle2 className="h-4 w-4 text-sky-400" />
                                        <span>AI-powered classroom access</span>
                                    </div>
                                </div>

                                <Link href={`/tutors/${tutor.id}/book`} className="block">
                                    <Button className="w-full bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold py-6 text-lg rounded-2xl group">
                                        Book Trial Lesson
                                        <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>

                                <p className="text-center text-xs text-slate-500 italic">
                                    Free cancellation up to 24h before lesson
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}

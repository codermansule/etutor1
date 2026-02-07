import { createServerClient } from "@/lib/supabase/server";
import TutorCard from "@/components/features/marketplace/TutorCard";
import { Input } from "@/components/ui/input";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Find Expert Tutors | ETUTOR",
    description: "Browse and book lessons with expert tutors across 50+ subjects.",
};

export default async function TutorsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; subject?: string; minPrice?: string; maxPrice?: string }>;
}) {
    const { q, subject, minPrice, maxPrice } = await searchParams;
    const supabase = await createServerClient();

    // Build query
    let query = supabase
        .from("tutor_profiles")
        .select(`
      id,
      headline,
      about,
      hourly_rate,
      average_rating,
      rating_count,
      is_verified,
      profiles (
        full_name,
        avatar_url
      ),
      tutor_subjects (
        subjects (
          name
        )
      )
    `)
        .eq("is_approved", true);

    if (subject) {
        query = query.filter("tutor_subjects.subjects.slug", "eq", subject);
    }

    if (minPrice) {
        query = query.gte("hourly_rate", parseFloat(minPrice));
    }

    if (maxPrice) {
        query = query.lte("hourly_rate", parseFloat(maxPrice));
    }

    const { data: tutors, error } = await query.order("average_rating", { ascending: false });

    if (error) {
        console.error("[tutors] query error:", error.message);
    }

    // Transform data for component
    const formattedTutors = (tutors || []).map((t: any) => ({
        id: t.id,
        full_name: t.profiles?.full_name ?? "Tutor",
        avatar_url: t.profiles?.avatar_url ?? null,
        headline: t.headline,
        about: t.about,
        hourly_rate: t.hourly_rate,
        average_rating: t.average_rating,
        rating_count: t.rating_count,
        is_verified: t.is_verified,
        subjects: (t.tutor_subjects || []).map((ts: any) => ts.subjects)
    }));

    return (
        <main className="py-12 space-y-12">
            <section className="text-center space-y-4">
                <h1 className="text-4xl font-black uppercase tracking-[0.2em] text-white sm:text-6xl">
                    Find Your Perfect <span className="text-sky-400">Tutor</span>
                </h1>
                <p className="mx-auto max-w-2xl text-slate-400">
                    Connect with expert educators for personalized 1-on-1 learning.
                    Vetted professionals, flexible schedules, and AI-powered classrooms.
                </p>
            </section>

            {/* Search & Filters Placeholder */}
            <section className="mx-auto max-w-5xl">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                            placeholder="Search by name, subject, or keyword..."
                            className="bg-slate-900 border-white/10 pl-10 h-12 text-white italic"
                        />
                    </div>
                    <Button variant="outline" className="border-white/10 text-white h-12 px-6 hover:bg-white/5">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>
            </section>

            <section className="mx-auto max-w-5xl">
                <div className="grid gap-6">
                    {formattedTutors.length > 0 ? (
                        formattedTutors.map((tutor) => (
                            <TutorCard key={tutor.id} tutor={tutor} />
                        ))
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                            <p className="text-slate-500 italic">No tutors found matching your criteria.</p>
                            <Button variant="link" className="text-sky-400 mt-2">Clear all filters</Button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

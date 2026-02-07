import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createServerClient();

    const { data: tutor } = await supabase
        .from("tutor_profiles")
        .select("hourly_rate, profiles (full_name)")
        .eq("id", id)
        .single();

    const profiles = tutor?.profiles as any;
    const name = profiles?.full_name ?? "Tutor";

    return {
        title: `Book a Lesson with ${name} | ETUTOR`,
        description: `Schedule a 1-on-1 online lesson with ${name}. Choose your preferred time slot and pay securely via Stripe.${tutor?.hourly_rate ? ` Starting at $${tutor.hourly_rate}/hr.` : ""}`,
        openGraph: {
            title: `Book a Lesson with ${name} | ETUTOR`,
            description: `Schedule a 1-on-1 online lesson with ${name} on ETUTOR.`,
            url: `https://etutor.studybitests.com/tutors/${id}/book`,
            siteName: "ETUTOR",
            type: "website",
        },
        robots: { index: false },
    };
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
    return children;
}

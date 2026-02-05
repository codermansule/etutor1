import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { ArrowLeft, Users, BookOpen, BrainCircuit } from "lucide-react";

type Subject = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!subject) return { title: "Subject Not Found | SBETUTOR" };

  return {
    title: `${subject.name} Tutoring | SBETUTOR`,
    description:
      subject.description ??
      `Find expert ${subject.name} tutors on SBETUTOR. Book 1-on-1 lessons, practice with AI, and track your progress.`,
  };
}

const categoryLabels: Record<string, string> = {
  languages: "Languages",
  academics: "Academics",
  professional: "Professional",
  "test-prep": "Test Prep",
  arts: "Arts & Music",
  technology: "Technology",
};

export default async function SubjectPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerClient();

  const { data: subject } = await supabase
    .from("subjects")
    .select("id, name, slug, category, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!subject) notFound();

  const typedSubject = subject as Subject;

  // Fetch child subjects
  const { data: children } = await supabase
    .from("subjects")
    .select("id, name, slug, description")
    .eq("parent_id", typedSubject.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const childSubjects = (children as Subject[] | null) ?? [];

  return (
    <main className="space-y-12 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: `${typedSubject.name} Tutoring`,
            description:
              typedSubject.description ??
              `Expert ${typedSubject.name} tutoring on SBETUTOR.`,
            provider: {
              "@type": "Organization",
              name: "SBETUTOR",
              url: "https://sb-e-tutor.example.com",
            },
          }),
        }}
      />

      <Link
        href="/subjects"
        className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        All subjects
      </Link>

      <section>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
          {categoryLabels[typedSubject.category ?? ""] ?? "Subject"}
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
          {typedSubject.name}
        </h1>
        {typedSubject.description && (
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            {typedSubject.description}
          </p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <Users className="h-6 w-6 shrink-0 text-sky-400" />
          <div>
            <p className="text-sm font-semibold text-white">Expert tutors</p>
            <p className="mt-1 text-xs text-slate-400">
              Vetted and approved tutors available for 1-on-1 lessons.
            </p>
          </div>
        </div>
        <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <BrainCircuit className="h-6 w-6 shrink-0 text-sky-400" />
          <div>
            <p className="text-sm font-semibold text-white">AI practice</p>
            <p className="mt-1 text-xs text-slate-400">
              Chat with our AI tutor, take adaptive quizzes, and build study
              plans.
            </p>
          </div>
        </div>
        <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
          <BookOpen className="h-6 w-6 shrink-0 text-sky-400" />
          <div>
            <p className="text-sm font-semibold text-white">
              Structured courses
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Enroll in multi-lesson courses designed by expert tutors.
            </p>
          </div>
        </div>
      </section>

      {childSubjects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            Specializations
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {childSubjects.map((child) => (
              <Link
                key={child.id}
                href={`/subjects/${child.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-sky-400/30 hover:bg-white/10"
              >
                <h3 className="text-lg font-semibold text-white group-hover:text-sky-300">
                  {child.name}
                </h3>
                {child.description && (
                  <p className="mt-2 text-sm text-slate-300">
                    {child.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center">
        <h2 className="text-2xl font-semibold text-white">
          Ready to learn {typedSubject.name}?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
          Create a free account and browse available tutors or start practicing
          with our AI coach right away.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/(auth)/register"
            className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:brightness-110"
          >
            Get started free
          </Link>
        </div>
      </section>
    </main>
  );
}

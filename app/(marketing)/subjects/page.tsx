import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Browse Subjects | SBETUTOR",
  description:
    "Explore all tutoring subjects on SBETUTOR — languages, academics, test prep, professional skills, arts, and technology.",
};

type Subject = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  parent_id: string | null;
};

const categoryLabels: Record<string, string> = {
  languages: "Languages",
  academics: "Academics",
  professional: "Professional",
  "test-prep": "Test Prep",
  arts: "Arts & Music",
  technology: "Technology",
};

const categoryOrder = [
  "languages",
  "academics",
  "technology",
  "test-prep",
  "professional",
  "arts",
];

export default async function SubjectsPage() {
  const supabase = createServerClient();

  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("id, name, slug, category, description, parent_id")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true });

  const subjects = (subjectsData as Subject[] | null) ?? [];

  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      label: categoryLabels[cat] ?? cat,
      items: subjects.filter((s) => s.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <main className="space-y-16 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "SBETUTOR Tutoring Subjects",
            description:
              "All subjects available for online tutoring on SBETUTOR.",
            itemListElement: subjects.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: s.name,
              url: `https://sb-e-tutor.example.com/subjects/${s.slug}`,
            })),
          }),
        }}
      />

      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          Subjects
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
          Find expert tutors in any subject
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Browse {subjects.length}+ subjects across languages, academics,
          technology, and more. Every subject has vetted tutors and AI support.
        </p>
      </section>

      {grouped.map((group) => (
        <section key={group.category} className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">{group.label}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((subject) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-sky-400/30 hover:bg-white/10"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {categoryLabels[subject.category ?? ""] ?? "Subject"}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white group-hover:text-sky-300">
                  {subject.name}
                </h3>
                {subject.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                    {subject.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      ))}

      {subjects.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="text-lg text-slate-400">
            Subjects are being loaded. Check back shortly.
          </p>
        </div>
      )}
    </main>
  );
}

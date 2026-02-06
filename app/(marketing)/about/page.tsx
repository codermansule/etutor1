import type { Metadata } from "next";
import Link from "next/link";
import { Users, Zap, Shield, Globe } from "lucide-react";
import { OrganizationJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "About ETUTOR | Online Tutoring Marketplace",
  description:
    "ETUTOR connects students with expert tutors through live video classrooms, AI coaching, and gamified learning — making education accessible worldwide.",
};

const values = [
  {
    icon: Users,
    title: "Student-first design",
    description:
      "Every feature exists to help students learn more effectively. From AI-adapted quizzes to streak-based motivation, we put learners at the center.",
  },
  {
    icon: Zap,
    title: "Technology-driven learning",
    description:
      "LiveKit video classrooms, GPT-4o AI tutoring, and pgvector-powered knowledge retrieval bring cutting-edge tech to everyday education.",
  },
  {
    icon: Shield,
    title: "Trust and quality",
    description:
      "Every tutor is vetted through a multi-step approval process. Reviews, ratings, and completion rates keep quality visible and accountable.",
  },
  {
    icon: Globe,
    title: "Globally accessible",
    description:
      "Timezone-aware scheduling, multi-language support, and mobile-responsive design ensure ETUTOR works for learners anywhere in the world.",
  },
];

const missionCards = [
  {
    icon: Users,
    title: "Accessible Education",
    description:
      "We believe every student deserves access to world-class tutoring regardless of location, background, or budget. ETUTOR removes barriers by connecting learners with expert tutors online.",
  },
  {
    icon: Zap,
    title: "Expert-Led Learning",
    description:
      "Our tutors are carefully vetted professionals who bring real-world expertise to every session. Combined with peer reviews and completion tracking, quality is always visible.",
  },
  {
    icon: Globe,
    title: "Technology That Helps",
    description:
      "From AI-generated study plans to interactive whiteboards and gamified progress tracking, our technology amplifies — never replaces — the human connection at the heart of great teaching.",
  },
];

export default function AboutPage() {
  return (
    <main className="space-y-20 py-12">
      <OrganizationJsonLd />

      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          About us
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
          Education that adapts to you
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          ETUTOR is a next-generation tutoring marketplace that pairs students
          with expert tutors, augments sessions with AI coaching, and keeps
          learners engaged through gamification and progress tracking.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {values.map((value) => (
          <div
            key={value.title}
            className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
              <value.icon className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {value.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {value.description}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Our Mission
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            What drives us every day
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {missionCards.map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
                <card.icon className="h-6 w-6 text-sky-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">{card.title}</h3>
              <p className="text-sm text-slate-300">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center">
        <h2 className="text-3xl font-semibold text-white">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
          Join ETUTOR today and experience expert tutoring powered by AI,
          live video, and a community that rewards your progress.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:brightness-110"
          >
            Create free account
          </Link>
          <Link
            href="/pricing"
            className="rounded-full border border-white/20 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
          >
            View pricing
          </Link>
        </div>
      </section>
    </main>
  );
}

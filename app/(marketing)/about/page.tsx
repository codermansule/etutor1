import type { Metadata } from "next";
import { Users, Zap, Shield, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "About SBETUTOR | Online Tutoring Marketplace",
  description:
    "SBETUTOR connects students with expert tutors through live video classrooms, AI coaching, and gamified learning — making education accessible worldwide.",
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
      "Timezone-aware scheduling, multi-language support, and mobile-responsive design ensure SBETUTOR works for learners anywhere in the world.",
  },
];

const milestones = [
  { label: "Phase 1", detail: "Foundation — Auth, marketing, profiles, CI/CD" },
  { label: "Phase 2", detail: "Marketplace — Tutor search, booking, Stripe payments" },
  { label: "Phase 3", detail: "Classroom — LiveKit video, whiteboard, messaging" },
  { label: "Phase 4", detail: "AI & Gamification — GPT-4o tutor, XP, badges, leaderboards" },
  { label: "Phase 5", detail: "Monetization — Subscriptions, courses, notifications, PWA" },
  { label: "Phase 6", detail: "Polish & Launch — SEO, analytics, accessibility, security audit" },
];

export default function AboutPage() {
  return (
    <main className="space-y-20 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            name: "SBETUTOR",
            url: "https://sb-e-tutor.example.com",
            description:
              "Online tutoring marketplace with AI coaching, live video classrooms, and gamified learning.",
          }),
        }}
      />

      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          About us
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
          Education that adapts to you
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          SBETUTOR is a next-generation tutoring marketplace that pairs students
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
            Development roadmap
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Built in six iterative phases
          </h2>
        </div>
        <div className="mx-auto grid max-w-3xl gap-4">
          {milestones.map((ms, i) => (
            <div
              key={ms.label}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-300">
                {i + 1}
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {ms.label}
                </p>
                <p className="mt-1 text-sm text-slate-200">{ms.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center">
        <h2 className="text-3xl font-semibold text-white">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
          Join SBETUTOR today and experience expert tutoring powered by AI,
          live video, and a community that rewards your progress.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <a
            href="/(auth)/register"
            className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:brightness-110"
          >
            Create free account
          </a>
          <a
            href="/pricing"
            className="rounded-full border border-white/20 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white/10"
          >
            View pricing
          </a>
        </div>
      </section>
    </main>
  );
}

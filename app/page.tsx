import Link from "next/link";
import FeatureCard from "@/components/ui/FeatureCard";
import StatCard from "@/components/ui/StatCard";

const heroStats = [
  {
    label: "Auth + Profiles",
    value: "Supabase ready",
    detail: "profiles, subjects, tutor roles, RLS",
  },
  { label: "Marketing", value: "SSG + ISR", detail: "landing + tutor pages" },
  {
    label: "Verification",
    value: "build / lint / test",
    detail: "CI workflow coverage",
  },
];

const featureHighlights = [
  {
    title: "Phase 1 foundation",
    description:
      "Next.js 14 App Router, Tailwind CSS 4, shadcn primitives, and a shared layout tuned for SBETUTOR.",
    tag: "Foundation",
  },
  {
    title: "Supabase core",
    description:
      "Project seeds for subjects, role-based profiles, and middleware guard rails to enforce auth routing.",
    tag: "Supabase",
  },
  {
    title: "Marketing & SEO",
    description:
      "Landing, pricing, and about pages with JSON-LD metadata plus SEO and OG defaults.",
    tag: "Marketing",
  },
  {
    title: "Verification automation",
    description:
      "Central CI workflow running build, ESLint, and tests before any phase moves to verification.",
    tag: "CI",
  },
];

const phaseTimeline = [
  {
    phase: "Phase 1 – Foundation",
    description:
      "Layout, auth scaffolding, marketing micro-site, Supabase schema + seeds, and CI gating.",
    status: "In progress",
  },
  {
    phase: "Phase 2 – Marketplace + Booking",
    description:
      "Tutor onboarding, availability editor, marketplace filters, Stripe checkout, and booking lifecycle.",
    status: "Upcoming",
  },
  {
    phase: "Phase 3 & beyond",
    description:
      "Classroom, AI tutor, gamification, notifications, payments V2, admin polish, and launch.",
    status: "Planned",
  },
];

export default function Home() {
  return (
    <main className="flex flex-col gap-16 py-12">
      <section className="grid gap-10 rounded-3xl bg-slate-900/70 px-6 py-10 shadow-[0_35px_120px_rgba(2,6,23,0.8)] lg:grid-cols-[2fr_1fr] lg:items-center lg:px-10">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Phase 1 sprint
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            SBETUTOR builds a Preply-style tutoring marketplace with hybrid
            monetization, LiveKit classrooms, AI tutors, and gamification.
          </h1>
          <p className="max-w-3xl text-lg text-slate-300">
            This sprint sets up the Next.js + Supabase foundation, auth flows,
            marketing collateral, and continuous verification so downstream
            phases (marketplace, classroom, AI) can move in parallel.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#features"
              className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:brightness-110"
            >
              View Phase 1 scope
            </Link>
            <Link
              href="https://github.com/codermansule/etutor1"
              className="rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-sky-300 hover:text-sky-300"
            >
              Open repo
            </Link>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_50px_rgba(3,7,18,0.9)]">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Verification plan
          </p>
          <h2 className="text-2xl font-semibold text-white">CI gate</h2>
          <p className="text-sm text-slate-300">
            All phases run the same verification list: `npm run build`,
            `npm run typecheck`, `npm run lint`, and `npm run test`. Cards stay
            in “Verification” until the workflow passes.
          </p>
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-400">
            <p>Phase 1 board ready (templates + docs + workflow)</p>
            <p className="mt-2 text-xs uppercase tracking-[0.4em] text-slate-500">
              Next: bring marketing + auth flows
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="space-y-6">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Phase 1 deliverables
          </p>
          <h2 className="text-3xl font-semibold text-white">What we tackle first</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featureHighlights.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section id="timeline" className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_30px_70px_rgba(15,23,42,0.55)]">
        <div className="flex w-full flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
            Delivery board
          </p>
          <h2 className="text-3xl font-semibold text-white">Aligned with the project board</h2>
          <p className="text-sm text-slate-300">
            Each phase has a column and dependencies, ensuring marketplace, classroom,
            AI, and payments workstreams can run in parallel once the foundation is solid.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {phaseTimeline.map((phase) => (
            <div
              key={phase.phase}
              className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  {phase.status}
                </p>
                <div className="h-2.5 w-2.5 rounded-full bg-sky-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">{phase.phase}</h3>
              <p className="text-sm text-slate-300">{phase.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="verification"
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/20 via-slate-900/50 to-slate-950/90 p-10 text-center shadow-[0_40px_80px_rgba(2,6,23,0.85)]"
      >
        <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
          Ready for Phase 1
        </p>
        <h2 className="mt-2 text-4xl font-semibold text-white">
          Launch the MNVP with confidence
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-slate-200">
          Before the marketplace or AI tutor ships, we lock in the Supabase auth
          experience, marketing pages, CI automation, and verification checklist.
          That keeps every downstream sprint parallel, auditable, and ready for
          rapid iteration.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="https://github.com/codermansule/etutor1"
            className="rounded-full bg-white/90 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:brightness-90"
          >
            Open the repo
          </Link>
          <Link
            href="#features"
            className="rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-sky-300 hover:text-sky-300"
          >
            Review deliverables
          </Link>
        </div>
      </section>
    </main>
  );
}

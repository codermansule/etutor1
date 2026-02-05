import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import FeatureCard from "@/components/ui/FeatureCard";
import StatCard from "@/components/ui/StatCard";

const heroStats = [
  { label: "Students taught", value: "5K+", detail: "Across 120+ countries" },
  { label: "Average tutoring rating", value: "4.9/5", detail: "Verified reviews" },
  { label: "AI practice sessions", value: "Unlimited", detail: "Tiered access available" },
];

const benefits = [
  {
    title: "Curated tutors & vetting",
    description:
      "Every tutor goes through a multi-step approval that checks certifications, teaching style, and availability.",
  },
  {
    title: "Hybrid monetization",
    description:
      "Book 1:1 lessons on-demand, purchase discounted packages, or unlock AI-assisted study plans via subscriptions.",
  },
  {
    title: "LiveKit classrooms",
    description:
      "WebRTC-based video rooms with screen share, tldraw whiteboard, annotated recordings, and chat.",
  },
];

const howItWorks = [
  {
    step: "Discover the right tutor",
    detail: "Filter by subject, availability, time zone, rating, and language. Preview intro videos at a glance.",
  },
  {
    step: "Book & pay securely",
    detail: "Stripe Checkout handles cards or wallets. Packages auto-apply platform commissions + reminders.",
  },
  {
    step: "Learn with LiveKit",
    detail: "Join video + whiteboard rooms, chat, record the session, and get post-lesson feedback + XP.",
  },
  {
    step: "Repeat & level up",
    detail: "Earn badges, maintain streaks, redeem coins in the rewards store, and get AI study plan suggestions.",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    benefits: ["Browse tutors", "Book standard lessons", "5 AI messages/day"],
  },
  {
    name: "Basic",
    price: "$9.99/mo",
    benefits: ["Unlimited AI chat/quizzes", "Study plans", "Rewards store access"],
  },
  {
    name: "Premium",
    price: "$24.99/mo",
    benefits: ["Priority booking", "Lesson recordings", "Premium profile themes"],
    highlighted: true,
  },
];

const testimonials = [
  {
    quote: "SBETUTOR helped me book expert test-prep tutors and the LiveKit rooms feel like a real classroom.",
    author: "Amelia, SAT student",
  },
  {
    quote: "Our tutors love the scheduling and payments dashboard. The XP + leaderboard keeps students engaged.",
    author: "Leo, Tutor",
  },
];

type Subject = {
  id?: string;
  name: string;
  category?: string | null;
  description?: string | null;
};

const subjectFallback: Subject[] = [
  { name: "English Conversations", category: "Languages", description: "Fluent English with feedback loops." },
  { name: "SAT & ACT Prep", category: "Test Prep", description: "Adaptive quizzes and tutor reviews." },
  { name: "Professional English", category: "Professional", description: "Career coaching, interviews, presentations." },
];

export default async function Home() {
  const supabase = await createServerClient();
  const { data: subjectsData } = await supabase
    .from("subjects")
    .select("id, name, category, description")
    .order("sort_order", { ascending: true })
    .limit(6);

  const subjects = (subjectsData as Subject[] | null) ?? null;

  return (
    <main className="space-y-24 py-12">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "SBETUTOR",
            url: "https://sb-e-tutor.example.com",
            logo: "https://sb-e-tutor.example.com/logo.png",
            sameAs: ["https://www.linkedin.com/company/sbetutor"],
            contactPoint: [
              { "@type": "ContactPoint", email: "support@sb-e-TUTOR.com", contactType: "customer support" },
            ],
          }),
        }}
      />

      <section className="grid gap-10 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-white lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-20">
        <div className="space-y-8">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Phase 1 · Etutoring marketplace</p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Learn live with tutors you trust and an AI coach that keeps you motivated.
          </h1>
          <p className="text-lg text-slate-300">
            SBETUTOR pairs students with vetted tutors, LiveKit classrooms, and adaptive AI study plans
            so every lesson, streak, and badge feeds your learning journey.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#subjects"
              className="rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 transition hover:brightness-95"
            >
              Explore subjects
            </Link>
            <Link
              href="#pricing"
              className="rounded-full border border-white/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-sky-400"
            >
              Pricing & plans
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 shadow-[0_25px_60px_rgba(2,6,23,0.8)]">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Platform proof</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Verified tutors • Responsive AI • Streaks</h2>
          <p className="mt-4">Hear from students and tutors who rely on SBETUTOR every week.</p>
          <div className="mt-6 space-y-3">
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.author} className="rounded-2xl border border-white/10 p-4">
                <p className="text-sm text-slate-200">“{testimonial.quote}”</p>
                <footer className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">{testimonial.author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6 px-6 lg:px-12">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Why SBETUTOR</p>
          <h2 className="text-3xl font-semibold text-white">Everything a modern tutoring marketplace needs</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit) => (
            <FeatureCard
              key={benefit.title}
              title={benefit.title}
              description={benefit.description}
              tag="Phase 1"
            />
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-10 text-center text-white lg:px-12">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">How it works</p>
        <h2 className="text-3xl font-semibold">From search to session in four steps</h2>
        <div className="grid gap-5 md:grid-cols-4">
          {howItWorks.map((item) => (
            <div key={item.step} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.step}</p>
              <p className="mt-3 text-sm text-slate-200">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="subjects" className="space-y-6 px-6 lg:px-12">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Subjects on SBETUTOR</p>
          <h2 className="text-3xl font-semibold text-white">Explore Tracked Disciplines</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(subjects ?? subjectFallback).map((subject) => (
            <div key={subject.name} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{subject.category ?? "Specialty"}</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">{subject.name}</h3>
              <p className="mt-3 text-sm text-slate-300">{subject.description ?? "Expert tutors + AI support."}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 to-slate-900 px-6 py-10 text-white lg:px-12">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Pricing & plans</p>
          <h2 className="text-3xl font-semibold">Choose the plan that fits your learning goal</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border ${
                plan.highlighted ? "border-sky-400 bg-slate-900" : "border-white/10 bg-white/5"
              } p-6`}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{plan.name}</p>
              <p className="mt-4 text-4xl font-semibold">{plan.price}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-200">
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>• {benefit}</li>
                ))}
              </ul>
              <button
                className="mt-6 w-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900"
                type="button"
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 px-6 lg:px-12">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Phase 1 delivery board</p>
          <h2 className="text-3xl font-semibold text-white">Delivered with verification in mind</h2>
          <p className="text-sm text-slate-300">
            Phase 1 ensures auth, profiles, and marketing pages are live before the marketplace, classroom, and AI modules begin.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            "Phase 1: Foundation, auth, marketing, CI",
            "Phase 2: Marketplace availability + Stripe",
            "Phase 3: LiveKit + messaging + AI",
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="text-sm text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

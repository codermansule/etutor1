import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  CalendarCheck,
  Video,
  Trophy,
  CreditCard,
  BrainCircuit,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works | ETUTOR",
  description:
    "Discover how ETUTOR works: find a tutor, book a lesson, learn in a LiveKit classroom, earn XP, and level up with AI-powered study plans.",
  openGraph: {
    title: "How It Works | ETUTOR",
    description: "From search to mastery in six steps. Find a tutor, book a lesson, and level up with AI study plans.",
    url: "https://etutor.studybitests.com/how-it-works",
    siteName: "ETUTOR",
    type: "website",
  },
  alternates: { canonical: "https://etutor.studybitests.com/how-it-works" },
};

const steps = [
  {
    icon: Search,
    title: "Find your perfect tutor",
    description:
      "Search by subject, price range, rating, availability, and language. Preview intro videos and read verified reviews before you commit.",
    detail:
      "Our marketplace uses full-text search with filters so you can find exactly the right tutor in seconds. Every tutor is vetted through admin approval.",
  },
  {
    icon: CalendarCheck,
    title: "Book a lesson",
    description:
      "Pick a time slot that works for you with our timezone-aware calendar. Pay securely through Stripe — cards, wallets, and packages supported.",
    detail:
      "Flexible cancellation (free up to 24h), rescheduling (free up to 12h), and lesson packages with discounts. Automated reminders keep you on track.",
  },
  {
    icon: Video,
    title: "Learn in a live classroom",
    description:
      "Join a LiveKit-powered video room with screen sharing, a collaborative whiteboard (tldraw), in-session chat, and session recording.",
    detail:
      "WebRTC technology ensures low-latency, high-quality video. Tutors can annotate screen shares and save whiteboard states for review.",
  },
  {
    icon: CreditCard,
    title: "Review and pay fairly",
    description:
      "After each lesson, rate your tutor and leave feedback. Tutors receive 85% of the lesson fee via automated weekly Stripe Connect payouts.",
    detail:
      "Transparent commission (15% platform fee). Reviews feed into tutor ratings and help future students make informed decisions.",
  },
  {
    icon: BrainCircuit,
    title: "Practice with your AI coach",
    description:
      "Between sessions, chat with our GPT-4o AI tutor. It adapts to your level, generates quizzes, identifies weak areas, and builds study plans.",
    detail:
      "The AI uses retrieval-augmented generation (RAG) with a custom knowledge base per subject. Your mastery state is tracked across every interaction.",
  },
  {
    icon: Trophy,
    title: "Level up and earn rewards",
    description:
      "Earn XP for every lesson, quiz, and streak. Unlock badges, climb leaderboards, complete challenges, and spend coins in the rewards store.",
    detail:
      "Gamification keeps you motivated: 100+ levels, 50+ badges, weekly challenges, and a rewards store with discounts and profile customizations.",
  },
];

export default function HowItWorksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How ETUTOR Works",
    description: "From search to mastery in six steps — find a tutor, book a lesson, learn in a live classroom, and level up with AI-powered study plans.",
    step: steps.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.description,
    })),
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <main className="space-y-20 py-12">
      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          How it works
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
          From search to mastery in six steps
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          ETUTOR combines expert human tutoring, AI coaching, and gamified
          progress tracking into one seamless learning experience.
        </p>
      </section>

      <section className="mx-auto max-w-4xl space-y-6">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className="flex gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 lg:p-8"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10">
                <step.icon className="h-7 w-7 text-sky-400" />
              </div>
              <span className="text-xs font-bold text-slate-500">
                Step {i + 1}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">
                {step.description}
              </p>
              <p className="mt-3 text-sm text-slate-400">{step.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-10 text-center">
        <h2 className="text-3xl font-semibold text-white">
          Ready to begin?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
          Create a free account, browse tutors, and book your first lesson in
          minutes.
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
    </>
  );
}

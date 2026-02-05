import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing & Plans | SBETUTOR",
  description:
    "Choose the SBETUTOR plan that fits your learning goals. Free, Basic, and Premium tiers with AI tutoring, gamification, and priority features.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with core tutoring features at no cost.",
    features: [
      "Browse and book tutors",
      "5 AI tutor messages per day",
      "1 AI quiz per day",
      "Basic gamification (XP & streaks)",
      "Access to free courses",
      "Basic profile",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    description: "Unlock the full learning experience with AI and rewards.",
    features: [
      "Everything in Free",
      "Unlimited AI chat & quizzes",
      "AI study plan generation",
      "Full gamification (badges, leaderboard)",
      "Challenges & rewards store",
      "Access to all courses",
      "Enhanced profile customization",
    ],
    cta: "Start Basic",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "$24.99",
    period: "/month",
    description: "Maximum value with recordings, priority, and premium perks.",
    features: [
      "Everything in Basic",
      "Lesson recording access",
      "Priority booking",
      "24-hour tutor response guarantee",
      "Premium profile frames & themes",
      "Priority AI processing",
    ],
    cta: "Go Premium",
    highlighted: true,
  },
];

const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrade or downgrade any time from your dashboard. Changes take effect at your next billing cycle.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "The Free tier lets you try all core features. Paid plans include a 7-day money-back guarantee.",
  },
  {
    q: "How does the AI tutor work?",
    a: "Our AI tutor uses GPT-4o with a custom knowledge base. It adapts to your level, generates quizzes, and creates personalized study plans.",
  },
  {
    q: "What happens to my progress if I downgrade?",
    a: "Your XP, badges, and streaks are always kept. Some premium features (recordings, priority booking) become unavailable until you upgrade again.",
  },
];

export default function PricingPage() {
  return (
    <main className="space-y-20 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />

      <section className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          Pricing & plans
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">
          Invest in your learning journey
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Every plan includes access to vetted tutors, LiveKit classrooms, and
          core gamification. Upgrade for unlimited AI features and premium perks.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-3xl border p-8 ${
              plan.highlighted
                ? "border-sky-400 bg-slate-900 shadow-[0_0_60px_rgba(14,165,233,0.15)]"
                : "border-white/10 bg-white/5"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950">
                Most popular
              </span>
            )}
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              {plan.name}
            </p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-semibold text-white">
                {plan.price}
              </span>
              <span className="text-sm text-slate-400">{plan.period}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">{plan.description}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-slate-200"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/(auth)/register"
              className={`mt-8 block rounded-full px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] transition ${
                plan.highlighted
                  ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 hover:brightness-110"
                  : "border border-white/20 text-white hover:bg-white/10"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl space-y-6">
        <h2 className="text-center text-3xl font-semibold text-white">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-base font-semibold text-white">{faq.q}</h3>
              <p className="mt-2 text-sm text-slate-300">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

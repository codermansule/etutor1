import type { Metadata } from "next";
import Link from "next/link";
import { FAQPageJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "FAQ | ETUTOR",
  description:
    "Frequently asked questions about ETUTOR — tutoring, AI features, payments, and your account.",
};

interface FAQ {
  question: string;
  answer: string;
}

const sections: { title: string; faqs: FAQ[] }[] = [
  {
    title: "General",
    faqs: [
      { question: "What is ETUTOR?", answer: "ETUTOR is an online tutoring marketplace that connects students with expert tutors through live video classrooms, AI-powered coaching, and gamified learning." },
      { question: "Who can use ETUTOR?", answer: "Anyone aged 13 or older can sign up as a student. Users under 18 need parental or guardian consent. Tutors must complete our vetting process before teaching." },
      { question: "Is ETUTOR free?", answer: "You can create a free account to browse tutors and book standard lessons. Premium features like unlimited AI chat, study plans, and priority booking require a paid subscription." },
      { question: "What subjects are available?", answer: "We offer tutoring across dozens of subjects including languages, test prep (SAT, ACT, IELTS), STEM, professional skills, and more. Visit our Subjects page for the full list." },
    ],
  },
  {
    title: "Tutoring",
    faqs: [
      { question: "How do I book a lesson?", answer: "Find a tutor using our search filters, select an available time slot, and confirm through Stripe-secured checkout. You'll receive a confirmation email with a link to your LiveKit classroom." },
      { question: "What happens during a lesson?", answer: "Lessons take place in LiveKit video rooms with screen sharing, a collaborative whiteboard, real-time chat, and optional recording. Sessions are typically 30 or 60 minutes." },
      { question: "Can I switch tutors?", answer: "Absolutely. You can book different tutors for different subjects or try several tutors until you find the right fit." },
      { question: "Are lessons recorded?", answer: "Sessions can be recorded with both the student's and tutor's consent. Recordings are available in your dashboard for review after the lesson." },
    ],
  },
  {
    title: "AI Features",
    faqs: [
      { question: "What is the AI tutor?", answer: "The AI tutor is a conversational assistant powered by Google Gemini that helps you practice topics, take quizzes, and get explanations between live sessions." },
      { question: "How do AI study plans work?", answer: "Based on your goals, subjects, and progress data, the AI generates personalized study plans that adapt as you complete lessons and practice sessions." },
      { question: "Is there a limit to AI usage?", answer: "Free accounts get 5 AI messages per day. Basic and Premium subscribers get unlimited AI chat, quizzes, and study plan generation." },
    ],
  },
  {
    title: "Payments",
    faqs: [
      { question: "What payment methods do you accept?", answer: "We accept all major credit and debit cards, Apple Pay, and Google Pay through our secure Stripe integration." },
      { question: "Can I get a refund?", answer: "New students are eligible for a full refund within 7 days of their first purchase. Individual lessons can be cancelled for a full refund at least 24 hours before the scheduled time." },
      { question: "How do subscriptions work?", answer: "Subscriptions are billed monthly. You can upgrade, downgrade, or cancel at any time. Your plan remains active until the end of the current billing period." },
      { question: "How do tutors get paid?", answer: "Tutors receive payouts through Stripe Connect. Earnings are deposited to their bank account on a weekly schedule after the platform commission is applied." },
    ],
  },
  {
    title: "Account",
    faqs: [
      { question: "How do I reset my password?", answer: "Click 'Forgot password' on the login page and enter your email. You'll receive a reset link within minutes." },
      { question: "Can I delete my account?", answer: "Yes. Go to your account settings and select 'Delete account'. Your personal data will be removed within 30 days." },
      { question: "How do I contact support?", answer: "Email us at support@etutor.studybitests.com or visit our Contact page. We respond within 24 hours on business days." },
    ],
  },
];

const allFaqs = sections.flatMap((s) => s.faqs);

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-12 px-6 py-12">
      <FAQPageJsonLd faqs={allFaqs} />

      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Support</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Frequently Asked Questions</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300">
          Find answers to common questions about ETUTOR. Can&apos;t find what you&apos;re looking for?{" "}
          <Link href="/contact" className="text-sky-400 hover:underline">Contact us</Link>.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-xl font-semibold text-white">{section.title}</h2>
          <div className="space-y-3">
            {section.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-white/10 bg-white/5"
              >
                <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-white transition hover:text-sky-300">
                  {faq.question}
                </summary>
                <p className="px-5 pb-4 text-sm text-slate-300">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

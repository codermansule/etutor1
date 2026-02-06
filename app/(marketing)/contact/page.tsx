import type { Metadata } from "next";
import { Mail, Headphones, GraduationCap } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | ETUTOR",
  description:
    "Get in touch with the ETUTOR team for general inquiries, technical support, or tutor applications.",
};

const contactCards = [
  {
    icon: Mail,
    title: "General Inquiries",
    description: "Questions about the platform, partnerships, or press.",
    email: "support@etutor.studybitests.com",
  },
  {
    icon: Headphones,
    title: "Technical Support",
    description: "Having trouble with lessons, payments, or your account?",
    email: "support@etutor.studybitests.com",
  },
  {
    icon: GraduationCap,
    title: "Tutor Applications",
    description: "Interested in teaching on ETUTOR? We'd love to hear from you.",
    email: "support@etutor.studybitests.com",
  },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-12 px-6 py-12">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Get in touch</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-300">
          We&apos;re here to help. Reach out via email or use the form below and we&apos;ll respond within 24 hours.
        </p>
        <p className="mt-2 text-sm text-slate-400">Support hours: Monday – Friday, 9 AM – 6 PM (UTC)</p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {contactCards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
              <card.icon className="h-6 w-6 text-sky-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{card.description}</p>
            <a href={`mailto:${card.email}`} className="mt-3 inline-block text-sm text-sky-400 hover:underline">
              {card.email}
            </a>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-semibold text-white">Send us a message</h2>
        <p className="mt-2 text-sm text-slate-400">Fill out the form and we&apos;ll get back to you.</p>
        <form className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Name</label>
            <input
              id="contact-name"
              type="text"
              placeholder="Your name"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Email</label>
            <input
              id="contact-email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="contact-subject" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Subject</label>
            <input
              id="contact-subject"
              type="text"
              placeholder="How can we help?"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Message</label>
            <textarea
              id="contact-message"
              rows={5}
              placeholder="Tell us more..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:brightness-110"
            >
              Send message
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

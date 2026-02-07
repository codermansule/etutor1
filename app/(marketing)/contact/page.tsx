import type { Metadata } from "next";
import { Mail, Headphones, GraduationCap } from "lucide-react";
import ContactForm from "@/components/features/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | ETUTOR",
  description:
    "Get in touch with the ETUTOR team for general inquiries, technical support, or tutor applications.",
  openGraph: {
    title: "Contact Us | ETUTOR",
    description: "Get in touch with the ETUTOR team for support, inquiries, or tutor applications.",
    url: "https://etutor.studybitests.com/contact",
    siteName: "ETUTOR",
    type: "website",
  },
  alternates: { canonical: "https://etutor.studybitests.com/contact" },
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
        <ContactForm />
      </section>
    </main>
  );
}

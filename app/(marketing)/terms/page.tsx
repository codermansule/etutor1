import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ETUTOR",
  description:
    "Read the ETUTOR terms of service covering account usage, payments, refunds, and platform policies.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12 text-slate-300">
      <header className="text-center">
        <h1 className="text-4xl font-semibold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: February 7, 2026</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Account Registration</h2>
        <p>To use ETUTOR, you must create an account with a valid email address. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account.</p>
        <p>You must be at least 13 years old to create an account. Users under 18 must have parental or guardian consent.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Student &amp; Tutor Responsibilities</h2>
        <p><strong className="text-white">Students</strong> agree to attend booked sessions on time, maintain respectful communication, and use the platform for legitimate educational purposes.</p>
        <p><strong className="text-white">Tutors</strong> agree to provide accurate profile information, maintain professional conduct during sessions, honor their posted availability, and deliver quality instruction as described in their profiles.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Payment &amp; Refund Policy</h2>
        <p>All payments are processed securely through Stripe. By purchasing a lesson or subscription, you agree to the following terms:</p>
        <ul className="list-inside list-disc space-y-2">
          <li><strong className="text-white">Money-back guarantee:</strong> New students are eligible for a full refund within 7 days of their first purchase if unsatisfied</li>
          <li><strong className="text-white">Lesson cancellation:</strong> Lessons may be cancelled at least 24 hours before the scheduled start time for a full refund</li>
          <li><strong className="text-white">Late cancellations:</strong> Cancellations within 24 hours of the lesson are non-refundable</li>
          <li><strong className="text-white">Subscriptions:</strong> Monthly subscriptions can be cancelled at any time and remain active until the end of the billing period</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Intellectual Property</h2>
        <p>All content on ETUTOR, including text, graphics, logos, and software, is the property of ETUTOR or its content providers and is protected by intellectual property laws.</p>
        <p>Lesson recordings belong to the student and tutor involved. Neither party may distribute recordings without the other&apos;s consent.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
        <p>ETUTOR provides a platform connecting students and tutors. We do not guarantee specific learning outcomes. Our liability is limited to the amount you have paid to ETUTOR in the 12 months preceding any claim.</p>
        <p>ETUTOR is not liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Termination</h2>
        <p>You may delete your account at any time through your account settings. ETUTOR reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse the platform.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Contact</h2>
        <p>
          For questions about these terms, contact us at{" "}
          <a href="mailto:support@etutor.studybitests.com" className="text-sky-400 hover:underline">
            support@etutor.studybitests.com
          </a>.
        </p>
      </section>
    </main>
  );
}

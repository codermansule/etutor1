import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ETUTOR",
  description:
    "Learn how ETUTOR collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-10 px-6 py-12 text-slate-300">
      <header className="text-center">
        <h1 className="text-4xl font-semibold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: February 7, 2026</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
        <p>We collect information you provide directly when creating an account, including your name, email address, profile photo, and learning preferences.</p>
        <p><strong className="text-white">Usage Data:</strong> We automatically collect information about how you use the platform, including pages visited, features used, session duration, and device information.</p>
        <p><strong className="text-white">Cookies:</strong> We use essential cookies for authentication and session management, and optional analytics cookies to improve the platform experience.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">How We Use Your Information</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Provide and maintain the ETUTOR platform</li>
          <li>Match you with tutors based on your preferences</li>
          <li>Generate AI-powered study plans and recommendations</li>
          <li>Process payments and manage subscriptions</li>
          <li>Send lesson reminders and platform updates</li>
          <li>Improve our services through aggregated analytics</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Third-Party Services</h2>
        <p>We integrate with trusted third-party providers to deliver our services:</p>
        <ul className="list-inside list-disc space-y-2">
          <li><strong className="text-white">Supabase</strong> — Authentication and database hosting</li>
          <li><strong className="text-white">Stripe</strong> — Payment processing</li>
          <li><strong className="text-white">Google AI (Gemini)</strong> — AI tutoring and study plan generation</li>
          <li><strong className="text-white">LiveKit</strong> — Video classroom infrastructure</li>
          <li><strong className="text-white">Sentry</strong> — Error monitoring and performance tracking</li>
        </ul>
        <p>Each service operates under its own privacy policy and we only share the minimum data required for them to function.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Data Retention &amp; Security</h2>
        <p>We retain your personal data for as long as your account is active. If you delete your account, we remove your personal information within 30 days, except where required by law.</p>
        <p>We use industry-standard security measures including encryption in transit (TLS), encrypted database connections, and role-based access controls to protect your data.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-inside list-disc space-y-2">
          <li><strong className="text-white">Access</strong> — Request a copy of your personal data</li>
          <li><strong className="text-white">Delete</strong> — Request deletion of your account and data</li>
          <li><strong className="text-white">Export</strong> — Download your data in a portable format</li>
          <li><strong className="text-white">Correct</strong> — Update inaccurate personal information</li>
          <li><strong className="text-white">Opt-out</strong> — Disable optional analytics cookies at any time</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Contact</h2>
        <p>
          For privacy-related inquiries, contact us at{" "}
          <a href="mailto:support@etutor.studybitests.com" className="text-sky-400 hover:underline">
            support@etutor.studybitests.com
          </a>.
        </p>
      </section>
    </main>
  );
}

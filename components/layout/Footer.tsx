import Link from "next/link";
import Logo from "../shared/Logo";

const platformLinks = [
  { href: "/subjects", label: "Subjects" },
  { href: "/tutors", label: "Tutors" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export default function Footer() {
  return (
    <footer aria-label="Site footer" role="contentinfo" className="border-t border-white/10 bg-slate-950/80 px-4 py-10 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-4">
        <div className="space-y-3">
          <Logo width={120} height={35} />
          <p className="text-sm text-slate-400">
            Empowering learners worldwide with expert tutors, AI coaching, and gamified progress.
          </p>
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} ETUTOR. All rights reserved.</p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Platform</p>
          <ul className="space-y-2">
            {platformLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Company</p>
          <ul className="space-y-2">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Legal</p>
          <ul className="space-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

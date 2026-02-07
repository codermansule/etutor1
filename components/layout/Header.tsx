import Link from "next/link";
import Logo from "../shared/Logo";
import MobileNav from "./MobileNav";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/subjects", label: "Subjects" },
  { href: "/tutors", label: "Tutors" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  return (
    <header aria-label="Site header" className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300 sm:px-6 lg:px-8">
        <Logo />
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-sky-300 hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 transition hover:text-white sm:inline"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="hidden rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:brightness-110 sm:inline"
          >
            Sign up
          </Link>
          <MobileNav navItems={navItems} />
        </div>
      </div>
    </header>
  );
}

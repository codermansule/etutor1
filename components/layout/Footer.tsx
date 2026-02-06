import Link from "next/link";
import Logo from "../shared/Logo";

export default function Footer() {
  return (
    <footer aria-label="Site footer" role="contentinfo" className="border-t border-white/10 bg-slate-950/80 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
          <Logo width={120} height={35} />
          <p>© {new Date().getFullYear()} ETUTOR. Empowering learners worldwide.</p>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em]">
            <Link href="/about" className="transition hover:text-white">About</Link>
            <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
            <Link href="/subjects" className="transition hover:text-white">Subjects</Link>
            <Link href="/tutors" className="transition hover:text-white">Tutors</Link>
            <Link href="/blog" className="transition hover:text-white">Blog</Link>
          </nav>
        </div>
        <p className="max-w-md text-center md:text-right">
          Designed for elite tutoring: LiveKit classrooms, AI-driven adaptive learning,
          and gamified educational experiences.
        </p>
      </div>
    </footer>
  );
}

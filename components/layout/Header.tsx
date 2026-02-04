import Link from "next/link";

const navItems = [
  { href: "#features", label: "Phase 1 scope" },
  { href: "#timeline", label: "Delivery board" },
  { href: "#verification", label: "Verification" },
  { href: "https://github.com/codermansule/etutor1", label: "Repository" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-base font-black text-white tracking-[0.4em] transition hover:text-sky-400"
        >
          SBETUTOR
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
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
            href="/"
            className="rounded-full border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-sky-400 hover:text-sky-300"
          >
            View roadmap
          </Link>
        </div>
      </div>
    </header>
  );
}

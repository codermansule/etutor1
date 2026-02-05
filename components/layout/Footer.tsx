import Logo from "../shared/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 items-center md:items-start text-center md:text-left">
          <Logo width={120} height={35} />
          <p>© {new Date().getFullYear()} ETUTOR. Empowering learners worldwide.</p>
        </div>
        <p className="max-w-md text-center md:text-right">
          Designed for elite tutoring: LiveKit classrooms, AI-driven adaptive learning,
          and gamified educational experiences.
        </p>
      </div>
    </footer>
  );
}

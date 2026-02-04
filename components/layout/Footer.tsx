export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 text-center md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} SBETUTOR. Built for Phase 1 foundation.</p>
        <p>
          Designed for Preply-style tutoring, LiveKit classrooms, Supabase auth,
          and AI + gamification readiness.
        </p>
      </div>
    </footer>
  );
}

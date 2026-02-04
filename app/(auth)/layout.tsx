import Link from "next/link";

export const metadata = {
  title: "SBETUTOR Auth",
  description: "Register or log in to the SBETUTOR dashboard.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-950 py-16 text-white">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_40px_80px_rgba(2,6,23,0.7)]">
        <div className="flex justify-between">
          <div>
            <Link href="/" className="text-lg font-bold uppercase tracking-[0.3em] text-sky-300">
              SBETUTOR
            </Link>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Phase 1 Auth
            </p>
          </div>
          <nav className="flex items-center gap-3 text-xs uppercase tracking-[0.3em]">
            <Link href="/(auth)/register" className="text-slate-300 hover:text-white">
              Register
            </Link>
            <Link href="/(auth)/login" className="text-slate-300 hover:text-white">
              Login
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}

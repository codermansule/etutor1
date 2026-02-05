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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 py-16 text-white">
      <div className="w-full max-w-xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_40px_80px_rgba(2,6,23,0.7)]">
        <div className="flex justify-between">
          <div>
            <Link
              href="/"
              className="text-lg font-bold uppercase tracking-[0.3em] text-sky-300"
            >
              SBETUTOR
            </Link>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
              Authentication
            </p>
          </div>
          <nav className="flex items-center gap-3 text-xs uppercase tracking-[0.3em]">
            <Link
              href="/register"
              className="text-slate-300 hover:text-white"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="text-slate-300 hover:text-white"
            >
              Login
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}

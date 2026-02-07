import Link from "next/link";
import Logo from "@/components/shared/Logo";

export const metadata = {
  title: "Sign In | ETUTOR",
  description: "Securely register or log in to ETUTOR, the elite adaptive tutoring platform.",
  openGraph: {
    title: "Sign In | ETUTOR",
    description: "Securely register or log in to ETUTOR, the elite adaptive tutoring platform.",
    siteName: "ETUTOR",
  },
  robots: { index: false },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 py-16 text-white">
      <div className="w-full max-w-xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_40px_80px_rgba(2,6,23,0.7)] backdrop-blur-xl">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Logo />
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">
              Secure Auth Portal
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

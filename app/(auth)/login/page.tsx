"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import SocialAuth from "@/components/features/auth/SocialAuth";

const supabase = createBrowserClient();

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword(form);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (user) {
      // Super Admin check
      if (user.email === "admin@etutor.studybitests.com") {
        window.location.href = "/admin";
        return;
      }

      // Fetch profile for role-based redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        window.location.href = "/admin";
      } else if (profile?.role === "tutor") {
        window.location.href = "/tutor";
      } else {
        window.location.href = "/student";
      }
    } else {
      window.location.href = "/student";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Welcome back to ETUTOR</h1>
        <p className="text-sm text-slate-400">Enter your credentials to access your dashboard.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300">Email Address</label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
            className="h-12 rounded-2xl border-white/10 bg-slate-950 px-4 text-white focus:ring-sky-500/50"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-slate-300">Password</label>
            <Link href="/recover" className="text-xs text-sky-400 hover:text-sky-300 font-medium">
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            className="h-12 rounded-2xl border-white/10 bg-slate-950 px-4 text-white focus:ring-sky-500/50"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-in fade-in zoom-in-95">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black uppercase tracking-widest transition-all"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <SocialAuth />

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-white font-bold hover:text-sky-400 transition">
          Sign up for free
        </Link>
      </p>
    </div>
  );
}

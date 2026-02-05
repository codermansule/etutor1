"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, GraduationCap, User } from "lucide-react";
import SocialAuth from "@/components/features/auth/SocialAuth";
import { cn } from "@/lib/utils";

const supabase = createBrowserClient();

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "student" as "student" | "tutor",
  });
  const [error, setError] = useState<null | string>(null);
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading(true);

    const { email, password, fullName, role } = form;
    const {
      data: { user },
      error: signUpError,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (user) {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email ?? email,
          full_name: fullName || user.email || "",
          role,
          timezone: "UTC",
        },
        { ignoreDuplicates: true },
      );

      // Send welcome email via our own SMTP (bypasses Supabase email)
      fetch("/api/auth/welcome-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName }),
      }).catch(() => {});
    }

    setStatus("Registration successful! Welcome to ETUTOR. Redirecting...");
    setTimeout(() => {
      window.location.href = role === "tutor" ? "/tutor" : "/student";
    }, 1500);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Join ETUTOR</h1>
        <p className="text-sm text-slate-400">Scale your learning or teaching journey today.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "student" })}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
              form.role === "student" ? "bg-sky-500/10 border-sky-500 text-white shadow-lg shadow-sky-500/10" : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/10"
            )}
          >
            <User className={cn("h-6 w-6", form.role === "student" ? "text-sky-400" : "text-slate-600")} />
            <span className="text-xs font-bold uppercase tracking-widest">Student</span>
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "tutor" })}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
              form.role === "tutor" ? "bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10" : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/10"
            )}
          >
            <GraduationCap className={cn("h-6 w-6", form.role === "tutor" ? "text-emerald-400" : "text-slate-600")} />
            <span className="text-xs font-bold uppercase tracking-widest">Tutor</span>
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300">Full Name</label>
          <Input
            placeholder="John Doe"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
            className="h-12 rounded-2xl border-white/10 bg-slate-950 px-4 text-white focus:ring-sky-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300">Email Address</label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="h-12 rounded-2xl border-white/10 bg-slate-950 px-4 text-white focus:ring-sky-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-300">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
            className="h-12 rounded-2xl border-white/10 bg-slate-950 px-4 text-white focus:ring-sky-500/50"
          />
        </div>

        {(error || status) && (
          <div className={cn(
            "flex items-start gap-2 p-3 rounded-xl text-sm animate-in fade-in zoom-in-95",
            error ? "bg-rose-500/10 border border-rose-500/20 text-rose-400" : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
          )}>
            {error ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <Loader2 className="h-4 w-4 shrink-0 mt-0.5 animate-spin" />}
            <p>{error || status}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
        </Button>
      </form>

      <SocialAuth />

      <p className="text-center text-sm text-slate-500 font-medium">
        Already have an account?{" "}
        <Link href="/login" className="text-white font-bold hover:text-sky-400 transition ml-1">
          Login here
        </Link>
      </p>
    </div>
  );
}

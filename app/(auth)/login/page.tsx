"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

const supabase = createBrowserClient();

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword(form);

    if (error) {
      setStatus(error.message);
      setLoading(false);
      return;
    }

    setStatus("Signed in successfully! Redirecting to dashboard...");
    setLoading(false);
    // Redirect handled by middleware or useRouter push if needed.
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-white">Welcome back to SBETUTOR</h1>
      <p className="text-sm text-slate-400">Use the same email you registered with.</p>
      <label className="block text-sm text-slate-300">
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
        />
      </label>
      <label className="block text-sm text-slate-300">
        Password
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-slate-700 to-slate-500 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-xs text-slate-500">
        Forgot your password?{" "}
        <Link href="/(auth)/recover" className="text-sky-400 underline">
          Request reset
        </Link>
      </p>
      {status && <p className="text-sm text-slate-300">{status}</p>}
    </form>
  );
}

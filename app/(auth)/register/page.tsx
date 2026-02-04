"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

const supabase = createBrowserClient();

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "student",
  });
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    const { email, password, fullName, role } = form;
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      setStatus(error.message);
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
    }

    setStatus("Registration successful! Check your inbox for verification.");
    setLoading(false);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-white">Create your SBETUTOR account</h1>
      <p className="text-sm text-slate-400">Select your role and get ready to book lessons.</p>
      <label className="block text-sm text-slate-300">
        Full name
        <input
          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
        />
      </label>
      <label className="block text-sm text-slate-300">
        Email
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
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
          onChange={handleChange}
          required
          minLength={8}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
        />
      </label>
      <label className="block text-sm text-slate-300">
        Role
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
        >
          <option value="student">Student</option>
          <option value="tutor">Tutor</option>
        </select>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
      {status && <p className="text-sm text-slate-300">{status}</p>}
    </form>
  );
}

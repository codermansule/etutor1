"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

const supabase = createBrowserClient();

export default function RecoverPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);
    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Password recovery email sent. Check your inbox.");
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-white">Reset your password</h1>
      <p className="text-sm text-slate-400">
        Enter the email you used while registering and we will send you a reset link.
      </p>
      <label className="block text-sm text-slate-300">
        Email
        <input
          type="email"
          className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-gradient-to-r from-slate-700 to-slate-500 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>
      {status && <p className="text-sm text-slate-300">{status}</p>}
    </form>
  );
}

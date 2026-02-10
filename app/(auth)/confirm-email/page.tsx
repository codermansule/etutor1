"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function ConfirmEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError(null);
    setResent(false);

    const supabase = createBrowserClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    setResending(false);
    if (resendError) {
      setError(resendError.message);
    } else {
      setResent(true);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20">
          <Mail className="h-10 w-10 text-sky-400" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Check your email</h1>
        <p className="text-sm text-slate-400">
          We sent a confirmation link to{" "}
          {email ? (
            <span className="text-white font-bold">{email}</span>
          ) : (
            "your email address"
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3 text-left">
        <p className="text-sm text-slate-300">
          Click the link in the email to verify your account and get started.
        </p>
        <p className="text-xs text-slate-500">
          The link will expire in 24 hours. If you don&apos;t see the email, check your spam folder.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {resent && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p>Confirmation email resent successfully!</p>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleResend}
          disabled={resending || !email}
          variant="outline"
          className="w-full h-12 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold"
        >
          {resending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Resend confirmation email
        </Button>

        <Link
          href="/login"
          className="block text-center text-sm text-slate-400 hover:text-white transition font-medium"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmEmailContent />
    </Suspense>
  );
}

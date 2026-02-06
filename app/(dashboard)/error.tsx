"use client";

import { useEffect } from "react";
import Link from "next/link";
import { captureError } from "@/lib/monitoring/sentry";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { boundary: "dashboard-error" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 p-8 text-center shadow-xl">
        <h2 className="mb-2 text-xl font-bold text-white">Dashboard Error</h2>
        <p className="mb-6 text-sm text-slate-400">
          {error.message || "Something went wrong loading this section"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-600"
          >
            Try again
          </button>
          <Link
            href="/student"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

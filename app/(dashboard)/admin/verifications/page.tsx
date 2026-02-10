import type { Metadata } from "next";
import AdminVerificationsClient from "./AdminVerificationsClient";

export const metadata: Metadata = {
  title: "Verifications | ETUTOR Admin",
};

export default function AdminVerificationsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-white">
          Verifications
        </h1>
        <p className="text-sm text-slate-400">
          Review and approve user verification documents.
        </p>
      </div>

      <AdminVerificationsClient />
    </div>
  );
}

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import VerificationStatus from "@/components/features/verification/VerificationStatus";
import TutorVerificationForm from "./TutorVerificationForm";

export const metadata: Metadata = {
  title: "Tutor Verification | ETUTOR",
};

export default async function TutorVerificationPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileRes, docsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("verification_status")
      .eq("id", user.id)
      .single(),
    supabase
      .from("verification_documents")
      .select("id, document_type, file_url, file_name, status, rejection_reason")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const verificationStatus = (profileRes.data?.verification_status ?? "unverified") as
    | "unverified"
    | "pending"
    | "verified"
    | "rejected";
  const documents = docsRes.data ?? [];

  const docMap: Record<string, (typeof documents)[0]> = {};
  for (const doc of documents) {
    if (!docMap[doc.document_type]) {
      docMap[doc.document_type] = doc;
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black uppercase tracking-[0.15em] text-white">
            Verification
          </h1>
          <VerificationStatus status={verificationStatus} />
        </div>
        <p className="text-sm text-slate-400">
          Upload your identity documents and CV to verify your tutor account.
        </p>
      </div>

      <TutorVerificationForm userId={user.id} docMap={docMap} />
    </div>
  );
}

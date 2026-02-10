import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profileRes, docsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("verification_status")
      .eq("id", user.id)
      .single(),
    supabase
      .from("verification_documents")
      .select("id, document_type, file_url, file_name, status, rejection_reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    verificationStatus: profileRes.data?.verification_status ?? "unverified",
    documents: docsRes.data ?? [],
  });
}

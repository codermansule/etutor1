import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = user.email === (process.env.SUPER_ADMIN_EMAIL ?? "admin@etutor.studybitests.com");
  if (adminProfile?.role !== "admin" && !isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [profileRes, docsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, verification_status")
      .eq("id", userId)
      .single(),
    supabase
      .from("verification_documents")
      .select("id, document_type, file_url, file_name, status, rejection_reason, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (!profileRes.data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    profile: profileRes.data,
    documents: docsRes.data ?? [],
  });
}

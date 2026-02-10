import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = user.email === (process.env.SUPER_ADMIN_EMAIL ?? "admin@etutor.studybitests.com");
  if (profile?.role !== "admin" && !isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get("status") ?? "pending";

  let query = supabase
    .from("verification_documents")
    .select(
      "id, user_id, document_type, file_url, file_name, status, rejection_reason, created_at, profiles!verification_documents_user_id_fkey(full_name, email, avatar_url)"
    )
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ documents: data ?? [] });
}

export async function PATCH(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isSuperAdmin = user.email === (process.env.SUPER_ADMIN_EMAIL ?? "admin@etutor.studybitests.com");
  if (profile?.role !== "admin" && !isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { documentId, action, rejectionReason } = body as {
    documentId: string;
    action: "approve" | "reject";
    rejectionReason?: string;
  };

  if (!documentId || !action) {
    return NextResponse.json(
      { error: "documentId and action are required." },
      { status: 400 }
    );
  }

  const newStatus = action === "approve" ? "approved" : "rejected";

  const { error: updateError } = await supabase
    .from("verification_documents")
    .update({
      status: newStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      ...(action === "reject" && rejectionReason ? { rejection_reason: rejectionReason } : {}),
    })
    .eq("id", documentId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Check if all documents for this user are now approved
  const { data: doc } = await supabase
    .from("verification_documents")
    .select("user_id")
    .eq("id", documentId)
    .single();

  if (doc?.user_id) {
    const { data: allDocs } = await supabase
      .from("verification_documents")
      .select("status")
      .eq("user_id", doc.user_id);

    const allApproved = allDocs?.length && allDocs.every((d) => d.status === "approved");
    const anyRejected = allDocs?.some((d) => d.status === "rejected");

    let newVerificationStatus = "pending";
    if (allApproved) newVerificationStatus = "verified";
    else if (anyRejected) newVerificationStatus = "rejected";

    await supabase
      .from("profiles")
      .update({ verification_status: newVerificationStatus })
      .eq("id", doc.user_id);
  }

  return NextResponse.json({ success: true });
}

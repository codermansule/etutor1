import { createServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const VALID_TYPES = ["cnic_front", "cnic_back", "passport", "live_photo", "cv", "profile_photo"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const documentType = formData.get("documentType") as string;

  if (!file || !documentType) {
    return NextResponse.json(
      { error: "File and document type are required." },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(documentType)) {
    return NextResponse.json(
      { error: "Invalid document type." },
      { status: 400 }
    );
  }

  const isPdf = file.type === "application/pdf";
  const maxSize = isPdf ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;

  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File must be under ${maxSize / 1024 / 1024} MB.` },
      { status: 400 }
    );
  }

  // Upload to Supabase Storage
  const ext = file.name.split(".").pop() ?? "bin";
  const filePath = `${user.id}/${documentType}_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("verification-documents")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage
    .from("verification-documents")
    .getPublicUrl(filePath);

  // Delete any existing pending document of same type for this user
  await supabase
    .from("verification_documents")
    .delete()
    .eq("user_id", user.id)
    .eq("document_type", documentType)
    .eq("status", "pending");

  // Insert document record
  const { error: dbError } = await supabase.from("verification_documents").insert({
    user_id: user.id,
    document_type: documentType,
    file_url: urlData.publicUrl,
    file_name: file.name,
    status: "pending",
  });

  if (dbError) {
    return NextResponse.json(
      { error: "Failed to save document record." },
      { status: 500 }
    );
  }

  // Update profile verification status to pending if currently unverified
  await supabase
    .from("profiles")
    .update({ verification_status: "pending" })
    .eq("id", user.id)
    .in("verification_status", ["unverified", "rejected"]);

  return NextResponse.json({ success: true, fileUrl: urlData.publicUrl });
}

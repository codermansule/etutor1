"use client";

import DocumentUpload from "@/components/features/verification/DocumentUpload";
import LivePhotoCapture from "@/components/features/verification/LivePhotoCapture";
import { useRouter } from "next/navigation";

interface DocInfo {
  id: string;
  file_url: string;
  file_name: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
}

interface VerificationFormProps {
  userId: string;
  docMap: Record<string, DocInfo>;
}

export default function VerificationForm({ userId, docMap }: VerificationFormProps) {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <DocumentUpload
          documentType="cnic_front"
          label="CNIC Front"
          description="Upload the front side of your CNIC/National ID."
          userId={userId}
          existing={docMap.cnic_front ?? null}
          onUploaded={refresh}
        />
        <DocumentUpload
          documentType="cnic_back"
          label="CNIC Back"
          description="Upload the back side of your CNIC/National ID."
          userId={userId}
          existing={docMap.cnic_back ?? null}
          onUploaded={refresh}
        />
      </div>

      <DocumentUpload
        documentType="passport"
        label="Passport (Optional)"
        description="Upload your passport if you prefer it over CNIC."
        userId={userId}
        existing={docMap.passport ?? null}
        onUploaded={refresh}
      />

      <LivePhotoCapture
        userId={userId}
        existing={docMap.live_photo ?? null}
        onCaptured={refresh}
      />
    </div>
  );
}

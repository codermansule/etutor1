"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

type DocumentType = "cnic_front" | "cnic_back" | "passport" | "cv";

interface ExistingDocument {
  id: string;
  file_url: string;
  file_name: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
}

interface DocumentUploadProps {
  documentType: DocumentType;
  label: string;
  description: string;
  userId: string;
  existing?: ExistingDocument | null;
  acceptPdf?: boolean;
  onUploaded?: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

export default function DocumentUpload({
  documentType,
  label,
  description,
  userId,
  existing,
  acceptPdf = false,
  onUploaded,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(existing?.file_url ?? null);
  const [status, setStatus] = useState<string>(existing?.status ?? "none");
  const [fileName, setFileName] = useState<string>(existing?.file_name ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = acceptPdf
    ? "image/png,image/jpeg,image/webp,application/pdf"
    : "image/png,image/jpeg,image/webp";

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = file.type === "application/pdf" ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      setError(`File must be under ${maxSize / 1024 / 1024} MB.`);
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    formData.append("userId", userId);

    try {
      const res = await fetch("/api/verification/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        setUploading(false);
        return;
      }

      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
      setFileName(file.name);
      setStatus("pending");
      onUploaded?.();
    } catch {
      setError("Upload failed. Please try again.");
    }

    setUploading(false);
  };

  const statusIcon = {
    pending: <Clock className="h-4 w-4 text-amber-400" />,
    approved: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    rejected: <XCircle className="h-4 w-4 text-rose-400" />,
  };

  const statusLabel = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {status !== "none" && (
          <div className="flex items-center gap-1.5">
            {statusIcon[status as keyof typeof statusIcon]}
            <span className="text-xs font-medium text-slate-400">
              {statusLabel[status as keyof typeof statusLabel]}
            </span>
          </div>
        )}
      </div>

      {preview && (
        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-950/50">
          <img src={preview} alt={label} className="w-full max-h-48 object-contain" />
        </div>
      )}

      {!preview && fileName && (
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 p-3">
          <FileText className="h-4 w-4 text-sky-400" />
          <span className="text-sm text-slate-300 truncate">{fileName}</span>
        </div>
      )}

      {existing?.status === "rejected" && existing.rejection_reason && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p>{existing.rejection_reason}</p>
        </div>
      )}

      {(status === "none" || status === "rejected") && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {status === "rejected" ? "Re-upload" : "Upload"}
        </Button>
      )}

      {error && <p className="text-xs text-rose-400">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}

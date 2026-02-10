"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileText,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

interface VerificationDoc {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  file_name: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  cnic_front: "CNIC Front",
  cnic_back: "CNIC Back",
  passport: "Passport",
  live_photo: "Live Photo",
  cv: "CV / Resume",
  profile_photo: "Profile Photo",
};

export default function AdminVerificationsClient() {
  const [docs, setDocs] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionInputs, setRejectionInputs] = useState<Record<string, string>>({});
  const [showRejectFor, setShowRejectFor] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/verifications?status=${filter}`);
    const data = await res.json();
    setDocs(data.documents ?? []);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleAction = async (
    documentId: string,
    action: "approve" | "reject"
  ) => {
    setActionLoading(documentId);
    await fetch("/api/admin/verifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId,
        action,
        rejectionReason: rejectionInputs[documentId] || undefined,
      }),
    });
    setActionLoading(null);
    setShowRejectFor(null);
    fetchDocs();
  };

  const filters: { value: StatusFilter; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition",
              filter === f.value
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-500">No documents found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-white/10 bg-slate-900/30 p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10">
                    {doc.profiles?.avatar_url ? (
                      <img
                        src={doc.profiles.avatar_url}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {doc.profiles?.full_name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {doc.profiles?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type}
                  </span>
                  {doc.status === "pending" && (
                    <Clock className="h-4 w-4 text-amber-400" />
                  )}
                  {doc.status === "approved" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  {doc.status === "rejected" && (
                    <XCircle className="h-4 w-4 text-rose-400" />
                  )}
                </div>
              </div>

              {/* Document preview */}
              <div className="rounded-xl border border-white/10 bg-slate-950/50 overflow-hidden">
                {doc.file_url &&
                (doc.document_type !== "cv" &&
                  !doc.file_name?.endsWith(".pdf")) ? (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <img
                      src={doc.file_url}
                      alt={doc.document_type}
                      className="w-full max-h-64 object-contain"
                    />
                  </a>
                ) : (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 p-4 text-sky-400 hover:text-sky-300 transition"
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-sm">{doc.file_name ?? "View document"}</span>
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Uploaded {new Date(doc.created_at).toLocaleDateString()}
                </span>
                {doc.rejection_reason && (
                  <span className="text-rose-400">
                    Reason: {doc.rejection_reason}
                  </span>
                )}
              </div>

              {/* Actions for pending documents */}
              {doc.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={actionLoading === doc.id}
                    onClick={() => handleAction(doc.id, "approve")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {actionLoading === doc.id ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-3 w-3" />
                    )}
                    Approve
                  </Button>

                  {showRejectFor === doc.id ? (
                    <div className="flex flex-1 gap-2">
                      <Input
                        placeholder="Rejection reason..."
                        value={rejectionInputs[doc.id] ?? ""}
                        onChange={(e) =>
                          setRejectionInputs((prev) => ({
                            ...prev,
                            [doc.id]: e.target.value,
                          }))
                        }
                        className="h-9 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actionLoading === doc.id}
                        onClick={() => handleAction(doc.id, "reject")}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRejectFor(null)}
                        className="border-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRejectFor(doc.id)}
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
                    >
                      <XCircle className="mr-2 h-3 w-3" />
                      Reject
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

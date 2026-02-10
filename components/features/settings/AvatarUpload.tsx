"use client";

import { useState, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Camera, Loader2 } from "lucide-react";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
}

export default function AvatarUpload({ userId, currentAvatarUrl }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createBrowserClient();
    const ext = file.name.split(".").pop() ?? "png";
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setError("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase
      .from("profiles")
      .update({ avatar_url: newUrl })
      .eq("id", userId);

    setAvatarUrl(newUrl);
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-white/20 bg-white/5 transition hover:border-sky-400/50"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Camera className="h-6 w-6 text-slate-500 transition group-hover:text-sky-400" />
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </button>
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-300">Profile Photo</p>
        <p className="text-xs text-slate-500">
          Click to upload. PNG, JPG, WEBP (max 2 MB).
        </p>
        {error && <p className="text-xs text-rose-400">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}

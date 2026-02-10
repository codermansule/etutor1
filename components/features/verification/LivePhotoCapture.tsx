"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, Loader2, RotateCcw, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExistingPhoto {
  id: string;
  file_url: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
}

interface LivePhotoCaptureProps {
  userId: string;
  existing?: ExistingPhoto | null;
  onCaptured?: () => void;
}

export default function LivePhotoCapture({ userId, existing, onCaptured }: LivePhotoCaptureProps) {
  const [streaming, setStreaming] = useState(false);
  const [captured, setCaptured] = useState<string | null>(existing?.file_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [status, setStatus] = useState<string>(existing?.status ?? "none");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreaming(true);
    } catch {
      setError("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreaming(false);
  }, []);

  const capturePhoto = () => {
    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        doCapture();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const doCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCaptured(dataUrl);
    stopCamera();
  };

  const retake = () => {
    setCaptured(null);
    setStatus("none");
    startCamera();
  };

  const uploadPhoto = async () => {
    if (!captured || captured.startsWith("http")) return;

    setUploading(true);
    setError(null);

    try {
      const blob = await (await fetch(captured)).blob();
      const file = new File([blob], "live-photo.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "live_photo");
      formData.append("userId", userId);

      const res = await fetch("/api/verification/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Upload failed.");
        setUploading(false);
        return;
      }

      setStatus("pending");
      onCaptured?.();
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
          <p className="text-sm font-bold text-white">Live Photo</p>
          <p className="text-xs text-slate-500">
            Take a photo with your webcam. Face the camera, ensure good lighting.
          </p>
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

      {existing?.status === "rejected" && existing.rejection_reason && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p>{existing.rejection_reason}</p>
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-video">
        {streaming && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-6xl font-black text-white animate-pulse">
                  {countdown}
                </span>
              </div>
            )}
          </>
        )}

        {!streaming && captured && (
          <img
            src={captured}
            alt="Captured photo"
            className="w-full h-full object-cover"
          />
        )}

        {!streaming && !captured && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
            <Camera className="h-8 w-8" />
            <p className="text-xs">Camera preview</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-2">
        {!streaming && !captured && (status === "none" || status === "rejected") && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startCamera}
            className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <Camera className="mr-2 h-4 w-4" />
            Open Camera
          </Button>
        )}

        {streaming && (
          <>
            <Button
              type="button"
              size="sm"
              onClick={capturePhoto}
              disabled={countdown !== null}
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={stopCamera}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
            >
              Cancel
            </Button>
          </>
        )}

        {!streaming && captured && status === "none" && (
          <>
            <Button
              type="button"
              size="sm"
              onClick={uploadPhoto}
              disabled={uploading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Upload Photo
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={retake}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
          </>
        )}

        {status === "rejected" && captured && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={retake}
            className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-slate-300"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Photo
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

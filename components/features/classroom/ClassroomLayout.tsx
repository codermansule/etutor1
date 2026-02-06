"use client";

import { useState, useCallback, useEffect } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  FocusLayout,
  FocusLayoutContainer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import SessionChat from "./SessionChat";
import ClassroomControls from "./ClassroomControls";

// Dynamic import for tldraw (heavy bundle)
const Whiteboard = dynamic(() => import("./Whiteboard"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-900">
      <p className="text-slate-400 text-sm animate-pulse">Loading whiteboard...</p>
    </div>
  ),
});

type ViewMode = "video" | "whiteboard" | "screenshare";

interface ClassroomLayoutProps {
  token: string;
  sessionId: string;
  userId: string;
  userName: string;
}

export default function ClassroomLayout({
  token,
  sessionId,
  userId,
  userName,
}: ClassroomLayoutProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("video");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionEnding, setSessionEnding] = useState(false);

  const handleEndSession = useCallback(async () => {
    if (sessionEnding) return;
    setSessionEnding(true);

    try {
      await fetch("/api/classroom/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    } catch (e) {
      console.error("Failed to end session:", e);
    }

    router.back();
  }, [sessionId, router, sessionEnding]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      onDisconnected={() => router.back()}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Exit
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Live Session
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
              Connected as
            </p>
            <p className="text-xs text-white font-semibold">{userName}</p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main View */}
        <div className="flex-1 relative">
          <ClassroomContent viewMode={viewMode} onScreenShareDetected={() => setViewMode("screenshare")} onScreenShareEnded={() => setViewMode("video")} />
        </div>

        {/* Chat Panel */}
        <SessionChat
          sessionId={sessionId}
          userId={userId}
          userName={userName}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </div>

      {/* Control Bar */}
      <ClassroomControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isChatOpen={isChatOpen}
        onChatToggle={() => setIsChatOpen((prev) => !prev)}
        onEndSession={handleEndSession}
      />

      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

// Inner component that uses LiveKit hooks (must be inside LiveKitRoom)
function ClassroomContent({
  viewMode,
  onScreenShareDetected,
  onScreenShareEnded,
}: {
  viewMode: ViewMode;
  onScreenShareDetected: () => void;
  onScreenShareEnded: () => void;
}) {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const screenShareTracks = tracks.filter(
    (t) => t.source === Track.Source.ScreenShare
  );
  const cameraTracks = tracks.filter(
    (t) => t.source === Track.Source.Camera
  );

  // Auto-detect screen sharing
  useEffect(() => {
    if (screenShareTracks.length > 0) {
      onScreenShareDetected();
    } else if (viewMode === "screenshare") {
      onScreenShareEnded();
    }
  }, [screenShareTracks.length, viewMode, onScreenShareDetected, onScreenShareEnded]);

  // Whiteboard view
  if (viewMode === "whiteboard") {
    return (
      <div className="h-full w-full relative">
        <Whiteboard />
        {/* Floating video thumbnails */}
        {cameraTracks.length > 0 && (
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            {cameraTracks.slice(0, 3).map((track) => (
              <div
                key={track.participant.sid}
                className="w-32 h-24 rounded-xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900"
              >
                <ParticipantTile
                  trackRef={track}
                  className="h-full w-full"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Screen share view — focused layout
  if (viewMode === "screenshare" && screenShareTracks.length > 0) {
    return (
      <FocusLayoutContainer className="h-full w-full">
        <FocusLayout trackRef={screenShareTracks[0]} />
      </FocusLayoutContainer>
    );
  }

  // Default video grid view
  return (
    <GridLayout
      tracks={cameraTracks}
      className="h-full w-full"
    >
      <ParticipantTile />
    </GridLayout>
  );
}

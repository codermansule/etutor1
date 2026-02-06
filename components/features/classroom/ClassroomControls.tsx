"use client";

import { useLocalParticipant } from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PenTool,
  MessageSquare,
  PhoneOff,
} from "lucide-react";

type ViewMode = "video" | "whiteboard" | "screenshare";

interface ClassroomControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isChatOpen: boolean;
  onChatToggle: () => void;
  onEndSession: () => void;
}

export default function ClassroomControls({
  viewMode,
  onViewModeChange,
  isChatOpen,
  onChatToggle,
  onEndSession,
}: ClassroomControlsProps) {
  const { localParticipant } = useLocalParticipant();

  const isMicMuted = !localParticipant.isMicrophoneEnabled;
  const isCamMuted = !localParticipant.isCameraEnabled;
  const isScreenSharing = localParticipant.isScreenShareEnabled;

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(isMicMuted);
  };

  const toggleCam = () => {
    localParticipant.setCameraEnabled(isCamMuted);
  };

  const toggleScreenShare = () => {
    localParticipant.setScreenShareEnabled(!isScreenSharing);
  };

  return (
    <div className="h-16 px-4 flex items-center justify-center gap-2 border-t border-white/10 bg-slate-900/80 backdrop-blur-xl">
      {/* Mic Toggle */}
      <button
        onClick={toggleMic}
        className={`h-11 w-11 rounded-full flex items-center justify-center transition ${
          isMicMuted
            ? "bg-red-500/10 text-red-400"
            : "text-white hover:bg-white/10"
        }`}
        title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
      >
        {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={toggleCam}
        className={`h-11 w-11 rounded-full flex items-center justify-center transition ${
          isCamMuted
            ? "bg-red-500/10 text-red-400"
            : "text-white hover:bg-white/10"
        }`}
        title={isCamMuted ? "Turn On Camera" : "Turn Off Camera"}
      >
        {isCamMuted ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={toggleScreenShare}
        className={`h-11 w-11 rounded-full flex items-center justify-center transition ${
          isScreenSharing
            ? "bg-green-500/10 text-green-400"
            : "text-white hover:bg-white/10"
        }`}
        title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
      >
        <MonitorUp className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10 mx-1" />

      {/* Whiteboard Toggle */}
      <button
        onClick={() =>
          onViewModeChange(viewMode === "whiteboard" ? "video" : "whiteboard")
        }
        className={`h-11 w-11 rounded-full flex items-center justify-center transition ${
          viewMode === "whiteboard"
            ? "bg-sky-500/20 text-sky-400"
            : "text-white hover:bg-white/10"
        }`}
        title="Toggle Whiteboard"
      >
        <PenTool className="h-5 w-5" />
      </button>

      {/* Chat Toggle */}
      <button
        onClick={onChatToggle}
        className={`h-11 w-11 rounded-full flex items-center justify-center transition ${
          isChatOpen
            ? "bg-sky-500/20 text-sky-400"
            : "text-white hover:bg-white/10"
        }`}
        title="Toggle Chat"
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10 mx-1" />

      {/* End Session */}
      <button
        onClick={onEndSession}
        className="h-11 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition"
        title="End Session"
      >
        <PhoneOff className="h-4 w-4" />
        <span className="hidden sm:inline">End</span>
      </button>
    </div>
  );
}

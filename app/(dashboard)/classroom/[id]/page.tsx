"use client";

import { useEffect, useState } from "react";
import {
    LiveKitRoom,
    VideoConference,
    GridLayout,
    ParticipantTile,
    RoomAudioRenderer,
    ControlBar,
    useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import { Loader2, ArrowLeft, Maximize2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ClassroomPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const supabase = createBrowserClient();
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function initClassroom() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            try {
                const resp = await fetch(
                    `/api/livekit/token?room=${params.id}&username=${user.user_metadata?.full_name || user.email}`
                );
                const data = await resp.json();

                if (data.error) throw new Error(data.error);
                setToken(data.token);
            } catch (e: any) {
                console.error(e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }

        initClassroom();
    }, [params.id, router, supabase]);

    if (loading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-sky-400" />
                <p className="text-sky-400 font-black uppercase tracking-[0.4em] animate-pulse">Initializing Classroom</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 gap-6 p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <XCircle className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider">Connection Failed</h2>
                    <p className="text-slate-400 max-w-md italic">{error}</p>
                </div>
                <Button onClick={() => router.back()} className="bg-white text-slate-950 uppercase font-black px-8">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden">
            {/* Immersive Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Exit Classroom
                    </Button>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <h1 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        Live Session: {params.id.slice(0, 8)}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Connected as</p>
                        <p className="text-xs text-white font-bold">{user?.user_metadata?.full_name || user?.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-500">
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Classroom Content */}
            <div className="flex-1 relative">
                <LiveKitRoom
                    video={true}
                    audio={true}
                    token={token}
                    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                    onDisconnected={() => router.back()}
                    className="h-full w-full flex flex-col"
                >
                    <VideoConference />
                </LiveKitRoom>
            </div>
        </div>
    );
}

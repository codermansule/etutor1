"use client";

import { useEffect, useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import ClassroomLayout from "@/components/features/classroom/ClassroomLayout";

interface SessionData {
  token: string;
  sessionId: string;
}

export default function ClassroomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, string> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initClassroom() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      try {
        const resp = await fetch(
          `/api/livekit/token?room=${params.id}&username=${encodeURIComponent(
            user.user_metadata?.full_name || user.email || "User"
          )}`
        );
        const data = await resp.json();

        if (data.error) throw new Error(data.error);
        setSessionData({
          token: data.token,
          sessionId: data.sessionId,
        });
      } catch (e: unknown) {
        console.error(e);
        setError(e instanceof Error ? e.message : "Unknown error");
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
        <p className="text-sky-400 font-black uppercase tracking-[0.4em] animate-pulse">
          Initializing Classroom
        </p>
      </div>
    );
  }

  if (error || !sessionData || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 gap-6 p-8 text-center">
        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <XCircle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            Connection Failed
          </h2>
          <p className="text-slate-400 max-w-md italic">
            {error || "Failed to initialize session"}
          </p>
        </div>
        <Button
          onClick={() => router.back()}
          className="bg-white text-slate-950 uppercase font-black px-8"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <ClassroomLayout
      token={sessionData.token}
      sessionId={sessionData.sessionId}
      userId={user.id}
      userName={user?.user_metadata?.full_name || user?.email || "User"}
    />
  );
}

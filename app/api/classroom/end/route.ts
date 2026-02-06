import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { awardXPWithClient } from "@/lib/gamification/engine";
import { updateStreakWithClient } from "@/lib/gamification/engine";
import { checkBadges } from "@/lib/gamification/badges";
import { updateChallengeProgress } from "@/lib/gamification/challenges";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch the session to calculate duration
    const { data: session } = await supabase
      .from("sessions")
      .select("id, started_at, status, student_id")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status === "ended") {
      return NextResponse.json({ message: "Session already ended" });
    }

    const endedAt = new Date();
    const startedAt = new Date(session.started_at);
    const durationSeconds = Math.round(
      (endedAt.getTime() - startedAt.getTime()) / 1000
    );

    // Update session
    const { error: updateError } = await supabase
      .from("sessions")
      .update({
        status: "ended",
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq("id", sessionId);

    if (updateError) {
      console.error("Failed to end session:", updateError);
      return NextResponse.json(
        { error: "Failed to end session" },
        { status: 500 }
      );
    }

    // Award XP to student for completing the lesson
    if (session.student_id) {
      try {
        await awardXPWithClient(supabase, session.student_id, 'lesson_completed', sessionId, 'Completed a tutoring session');
        await updateStreakWithClient(supabase, session.student_id);
        await checkBadges(session.student_id, supabase);
        await updateChallengeProgress(session.student_id, 'lesson_completed', supabase);
      } catch (xpError) {
        console.error('Failed to award XP:', xpError);
        // Don't fail the session end if XP awarding fails
      }
    }

    return NextResponse.json({
      message: "Session ended",
      durationSeconds,
    });
  } catch (e) {
    console.error("End session error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

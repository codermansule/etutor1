import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get("room");
  const username = req.nextUrl.searchParams.get("username");

  if (!room || !username) {
    return NextResponse.json(
      { error: 'Missing "room" or "username" query parameter' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured: LiveKit credentials missing" },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
  });

  at.addGrant({
    roomJoin: true,
    room: room,
    canPublish: true,
    canSubscribe: true,
  });

  // Upsert session record for this room (booking_id = room param)
  let sessionId = "";
  try {
    const supabase = createServiceRoleClient();

    // Check if a session already exists for this room
    const { data: existing } = await supabase
      .from("sessions")
      .select("id")
      .eq("livekit_room_name", room)
      .neq("status", "ended")
      .maybeSingle();

    if (existing) {
      sessionId = existing.id;
      // Update status to active if still waiting
      await supabase
        .from("sessions")
        .update({ status: "active" })
        .eq("id", existing.id)
        .eq("status", "waiting");
    } else {
      // Look up booking to get tutor_id and student_id
      const { data: booking } = await supabase
        .from("bookings")
        .select("id, tutor_id, student_id")
        .eq("id", room)
        .maybeSingle();

      const { data: newSession } = await supabase
        .from("sessions")
        .insert({
          booking_id: booking?.id || null,
          tutor_id: booking?.tutor_id || null,
          student_id: booking?.student_id || null,
          livekit_room_name: room,
          status: "waiting",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      sessionId = newSession?.id || "";
    }
  } catch (e) {
    console.error("Failed to upsert session:", e);
    // Don't block the token generation if session tracking fails
  }

  return NextResponse.json({
    token: await at.toJwt(),
    sessionId,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/monitoring/sentry";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY || "",
  process.env.LIVEKIT_API_SECRET || ""
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const authHeader = req.headers.get("authorization") || "";

    // Verify the webhook signature
    const event = await receiver.receive(body, authHeader);

    const supabase = createServiceRoleClient();

    switch (event.event) {
      case "egress_ended": {
        // Recording completed — save URL to session
        const egress = event.egressInfo;
        if (egress?.roomName) {
          const fileResults = egress.fileResults || [];
          const recordingUrl =
            fileResults.length > 0 ? fileResults[0].location : null;

          if (recordingUrl) {
            await supabase
              .from("sessions")
              .update({ recording_url: recordingUrl })
              .eq("livekit_room_name", egress.roomName)
              .neq("status", "ended");
          }
        }
        break;
      }

      case "room_finished": {
        // Room ended — mark session as ended if not already
        const room = event.room;
        if (room?.name) {
          const { data: session } = await supabase
            .from("sessions")
            .select("id, started_at")
            .eq("livekit_room_name", room.name)
            .neq("status", "ended")
            .maybeSingle();

          if (session) {
            const endedAt = new Date();
            const startedAt = new Date(session.started_at);
            const durationSeconds = Math.round(
              (endedAt.getTime() - startedAt.getTime()) / 1000
            );

            await supabase
              .from("sessions")
              .update({
                status: "ended",
                ended_at: endedAt.toISOString(),
                duration_seconds: durationSeconds,
              })
              .eq("id", session.id);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    captureError(e, { route: "POST /api/livekit/webhook" });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

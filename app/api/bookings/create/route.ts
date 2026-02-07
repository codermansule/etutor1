import { NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@/lib/supabase/server";
import { bookingCreateSchema, parseBody } from "@/lib/validations/api-schemas";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "You must be logged in to book a lesson." }, { status: 401 });
  }

  const parsed = parseBody(bookingCreateSchema, await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { tutorId, subjectId, scheduledAt, price, currency } = parsed.data;

  const { data: mapping, error: mappingErr } = await supabase
    .from("tutor_subjects")
    .select("subject_id")
    .eq("tutor_id", tutorId)
    .eq("subject_id", subjectId)
    .maybeSingle();

  if (mappingErr) {
    return NextResponse.json({ error: "Unable to verify tutor subjects." }, { status: 500 });
  }

  if (!mapping) {
    return NextResponse.json({ error: "Tutor does not teach the selected subject." }, { status: 400 });
  }

  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      student_id: user.id,
      tutor_id: tutorId,
      subject_id: subjectId,
      scheduled_at: scheduledAt,
      price,
      currency,
      status: "pending",
    })
    .select("id")
    .single();

  if (bookingErr || !booking) {
    return NextResponse.json(
      { error: bookingErr?.message ?? "Failed to create booking." },
      { status: 500 },
    );
  }

  return NextResponse.json({ bookingId: booking.id });
}

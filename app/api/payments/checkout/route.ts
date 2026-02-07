import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { captureError } from "@/lib/monitoring/sentry";
import { checkoutSchema, parseBody } from "@/lib/validations/api-schemas";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://localhost:3000";
const safePayInstructions = process.env.SAFEPAY_INSTRUCTIONS ?? "Send payment via SafePay to 0300-0000000 with the booking ID and email us at support@studybitests.com.";

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2022-11-15" });

export async function POST(req: NextRequest) {
  try {
    const parsed = parseBody(checkoutSchema, await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { bookingId, studentEmail, amount, currency, paymentMethod } = parsed.data;

    const supabase = createServiceRoleClient();
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("id, student_id, tutor_id")
      .eq("id", bookingId)
      .maybeSingle();

    if (bookingErr || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (paymentMethod === "safepay") {
      await supabase
        .from("bookings")
        .update({ status: "awaiting_payment", notes: `SafePay requested ${bookingId}` })
        .eq("id", bookingId);

      const tailoredInstructions = `${safePayInstructions} Reference: ${bookingId}. Amount: ${amount} ${currency.toUpperCase()}.`;

      return NextResponse.json({
        safePay: true,
        instructions: tailoredInstructions,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: "ETUTOR Lesson",
              description: `Lesson with tutor ${booking.tutor_id}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/tutors/${booking.tutor_id}`,
      metadata: {
        booking_id: bookingId,
        student_email: studentEmail,
      },
    });

    await supabase
      .from("bookings")
      .update({
        status: "pending_payment",
        stripe_payment_intent_id: session.payment_intent ?? null,
      })
      .eq("id", bookingId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    captureError(error, { route: "POST /api/payments/checkout" });
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 });
  }
}

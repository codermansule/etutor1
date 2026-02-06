import { createServiceRoleClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { format } from "date-fns";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY for booking confirmation");
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2022-11-15" });

type Booking = {
  id: string;
  scheduled_at: string;
  subject_id: string;
  price: number;
  currency: string;
  status: string;
};

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams.session_id;

  if (!sessionId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Missing session</h1>
          <p className="mt-3 text-sm text-slate-300">
            We could not locate your checkout session. Please try again or contact support.
          </p>
        </div>
      </div>
    );
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });

  const bookingId = session.metadata?.booking_id;
  const supabase = createServiceRoleClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      id,
      scheduled_at,
      price,
      subject_id,
      status,
      tutor_profiles!inner(id, full_name)
    `)
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Booking not found</h1>
          <p className="mt-3 text-sm text-slate-300">
            Our records show no booking associated with this session. Reach out to support if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-2xl rounded-3xl border border-white/10 bg-slate-950/60 p-10">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Booking confirmation</p>
        <h1 className="mt-3 text-3xl font-black text-white">Lesson Scheduled</h1>
        <p className="mt-2 text-sm text-slate-400">Booking #{booking.id}</p>
        <div className="mt-6 space-y-4">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Scheduled for</span>
            <span>{format(new Date(booking.scheduled_at), "EEEE, MMMM d, yyyy 'at' HH:mm")}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Payment status</span>
            <span className="font-semibold text-white">
              {booking.status === "confirmed" ? "Confirmed" : booking.status}
            </span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Tutor</span>
            <span className="text-white">{booking.tutors?.full_name ?? "Tutor"}</span>
          </div>
        </div>
        <div className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-bold text-white">Next steps</p>
          <ul className="mt-2 space-y-2">
            <li>Check your inbox for a welcome email from onboarding@studybitests.com.</li>
            <li>You will receive lesson reminders 24h and 1h before the session.</li>
            <li>Need to reschedule or cancel? Visit your dashboard.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

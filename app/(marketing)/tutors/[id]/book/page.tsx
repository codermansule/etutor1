"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, ShieldCheck, CheckCircle2, Sparkles, CreditCard } from "lucide-react";
import BookingCalendar from "@/components/features/booking/BookingCalendar";
import { motion, AnimatePresence } from "framer-motion";

export default function BookTutorPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const supabase = createBrowserClient();
    const [loading, setLoading] = useState(true);
    const [tutor, setTutor] = useState<any>(null);
    const [availability, setAvailability] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [safePayMessage, setSafePayMessage] = useState<string | null>(null);

    useEffect(() => {
        async function loadData() {
            // Fetch tutor info
            const { data: tutorData } = await supabase
                .from("tutor_profiles")
                .select(`
          *,
          profiles (
            full_name,
            avatar_url,
            timezone
          )
        `)
                .eq("id", params.id)
                .single();

            if (!tutorData) return notFound();
            setTutor(tutorData);

            // Fetch availability
            const { data: availData } = await supabase
                .from("availability")
                .select("*")
                .eq("tutor_id", params.id);

            setAvailability(availData || []);
            setLoading(false);
        }
        loadData();
    }, [params.id, supabase]);

    const handleBooking = async (paymentMethod: "card" | "safepay") => {
        if (!selectedSlot) return;
        setBookingLoading(true);
        setSafePayMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push(`/login?redirectedFrom=/tutors/${params.id}/book`);
                return;
            }

            // 1. Create booking in Supabase
            const { data: booking, error: bookingErr } = await supabase
                .from("bookings")
                .insert({
                    student_id: user.id,
                    tutor_id: tutor.id,
                    subject_id: tutor.tutor_subjects?.[0]?.subject_id || "00000000-0000-0000-0000-000000000000", // Fallback
                    scheduled_at: selectedSlot.toISOString(),
                    price: tutor.hourly_rate,
                    status: "pending",
                })
                .select()
                .single();

            if (bookingErr) throw bookingErr;

            const amount = typeof tutor.hourly_rate === "number" ? tutor.hourly_rate : parseFloat(tutor.hourly_rate ?? "0");
            const response = await fetch("/api/payments/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    bookingId: booking.id,
                    studentEmail: user.email,
                    amount,
                    currency: "USD",
                    paymentMethod,
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload.error ?? "Payment initiation failed");
            }

            if (payload.safePay) {
                setSafePayMessage(payload.instructions);
                setBookingLoading(false);
                return;
            }

            if (payload.url) {
                window.location.href = payload.url;
                return;
            }

            throw new Error("No payment URL returned");
        } catch (err) {
            console.error(err);
            alert("Failed to book lesson.");
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-sky-400" />
            </div>
        );
    }

    return (
        <main className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl space-y-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-slate-400 hover:text-white mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Profile
                </Button>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Calendar Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white">Book Your <span className="text-sky-400">Lesson</span></h1>
                        <BookingCalendar
                            availability={availability}
                            onSelectSlot={setSelectedSlot}
                            selectedDate={selectedSlot}
                            tutorTimezone={tutor.profiles.timezone || "UTC"}
                        />
                    </div>

                    {/* Checkout Section */}
                    <div className="space-y-6">
                        <Card className="rounded-3xl border-white/10 bg-slate-900 p-8 shadow-2xl sticky top-24">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-white/10">
                                        <AvatarImage src={tutor.profiles.avatar_url ?? ""} alt={tutor.profiles.full_name} />
                                        <AvatarFallback className="bg-sky-500/10 text-sky-300 font-bold">
                                            {tutor.profiles.full_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <p className="text-sm font-bold text-white">{tutor.profiles.full_name}</p>
                                            {tutor.is_verified && <ShieldCheck className="h-3 w-3 text-sky-400" />}
                                        </div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Tutor Profile</p>
                                    </div>
                                </div>

                                <div className="space-y-3 py-6 border-y border-white/5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Lesson (1 hour)</span>
                                        <span className="text-white font-bold">${tutor.hourly_rate}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Service Fee</span>
                                        <span className="text-emerald-400 font-bold">Free</span>
                                    </div>
                                    <div className="pt-3 flex justify-between items-end">
                                        <span className="text-xs font-bold text-white uppercase tracking-widest">Total</span>
                                        <span className="text-3xl font-black text-white">${tutor.hourly_rate}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10">
                                        <Sparkles className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                            You are booking a 1-on-1 private lesson. Your AI learning credits will be synchronized after completion.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        onClick={() => handleBooking("card")}
                                        disabled={!selectedSlot || bookingLoading}
                                        className="w-full bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-bold h-14 rounded-2xl group"
                                    >
                                        {bookingLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                Confirm & Pay
                                                <CreditCard className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleBooking("safepay")}
                                        disabled={!selectedSlot || bookingLoading}
                                        className="w-full border-white/20 text-xs uppercase tracking-widest text-white"
                                    >
                                        Pay via SafePay (Pakistan)
                                    </Button>
                                </div>

                                <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest font-black">
                                    Secure checkout via Stripe
                                </p>
                                {safePayMessage && (
                                    <div className="mt-2 rounded-xl bg-white/5 p-3 text-xs text-slate-200">
                                        {safePayMessage}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </main>
    );
}

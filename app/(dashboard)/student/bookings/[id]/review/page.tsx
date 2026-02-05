"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Star, Loader2, ArrowLeft, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ReviewPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const supabase = createBrowserClient();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [booking, setBooking] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        async function loadBooking() {
            const { data, error } = await supabase
                .from("bookings")
                .select(`
          *,
          tutor_profiles (
            profiles (
              full_name,
              avatar_url
            )
          )
        `)
                .eq("id", params.id)
                .single();

            if (data) {
                setBooking(data);
            }
            setLoading(false);
        }
        loadBooking();
    }, [params.id, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            const { error } = await supabase
                .from("reviews")
                .insert({
                    booking_id: params.id,
                    student_id: user.id,
                    tutor_id: booking.tutor_id,
                    rating,
                    comment,
                });

            if (error) throw error;

            alert("Review submitted! Thank you for your feedback.");
            router.push("/student/my-lessons");
        } catch (err) {
            console.error(err);
            alert("Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center py-20">
                <h2 className="text-white text-xl">Booking not found.</h2>
                <Button variant="link" onClick={() => router.back()}>Go back</Button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl py-12 px-4">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-slate-400 hover:text-white mb-8"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <Card className="border-white/10 bg-slate-900/50 p-8 backdrop-blur-xl shadow-2xl">
                    <div className="flex flex-col items-center text-center space-y-4 mb-8">
                        <div className="h-16 w-16 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                            <Sparkles className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white">Rate Your <span className="text-sky-400">Lesson</span></h1>
                        <p className="text-slate-400 text-sm max-w-sm">
                            Your feedback helps {booking.tutor_profiles.profiles.full_name} and other students!
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex flex-col items-center gap-4">
                            <Label className="uppercase tracking-[0.2em] text-xs font-black text-slate-500">Overall Rating</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        className="transition-transform hover:scale-125"
                                    >
                                        <Star
                                            className={`h-10 w-10 ${(hoverRating || rating) >= star
                                                    ? "fill-amber-400 text-amber-400"
                                                    : "text-slate-700"
                                                } transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                                {rating === 5 && "Excellent!"}
                                {rating === 4 && "Great!"}
                                {rating === 3 && "Good"}
                                {rating === 2 && "Fair"}
                                {rating === 1 && "Poor"}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="comment" className="uppercase tracking-[0.2em] text-xs font-black text-slate-500">Comment (optional)</Label>
                            <textarea
                                id="comment"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="What did you learn? What did you like about the teaching style?"
                                className="flex w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm ring-offset-background placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 transition-all text-white"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-sky-500 text-slate-950 font-black uppercase h-14 rounded-2xl group"
                        >
                            {submitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Submit Review
                                    <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </>
                            )}
                        </Button>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}

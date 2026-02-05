import { createServerClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Calendar, Clock, User, MessageCircle, MoreVertical, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default async function MyLessonsPage() {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: bookings } = await supabase
        .from("bookings")
        .select(`
      *,
      tutor_profiles (
        profiles (
          full_name,
          avatar_url
        )
      ),
      subjects (
        name
      )
    `)
        .eq("student_id", user.id)
        .order("scheduled_at", { ascending: false });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white">My Lessons</h1>
                <p className="mt-1 text-sm text-slate-400">View and manage your upcoming and past sessions.</p>
            </div>

            <div className="grid gap-6">
                {bookings && bookings.length > 0 ? (
                    bookings.map((booking) => {
                        const date = new Date(booking.scheduled_at);
                        const isCompleted = booking.status === "completed";
                        const dateStr = format(date, "EEEE, MMMM d, yyyy");
                        const timeStr = format(date, "HH:mm");

                        return (
                            <Card key={booking.id} className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all hover:bg-slate-900 overflow-hidden">
                                <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                                    <div className="flex items-center gap-4 min-w-[300px]">
                                        <Avatar className="h-12 w-12 border-2 border-white/10">
                                            <AvatarImage src={booking.tutor_profiles.profiles.avatar_url} alt={booking.tutor_profiles.profiles.full_name} />
                                            <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold">
                                                {booking.tutor_profiles.profiles.full_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-bold text-white">{booking.tutor_profiles.profiles.full_name}</p>
                                            <p className="text-xs text-sky-400 font-bold uppercase tracking-widest mt-0.5">
                                                {booking.subjects?.name || "Subject"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 flex-1 lg:grid-cols-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <Calendar className="h-3 w-3" />
                                                Date
                                            </div>
                                            <p className="text-sm font-bold text-white">{dateStr}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <Clock className="h-3 w-3" />
                                                Time
                                            </div>
                                            <p className="text-sm font-bold text-white">{timeStr} (1h)</p>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                Status
                                            </div>
                                            <Badge variant={
                                                booking.status === "confirmed" ? "success" :
                                                    booking.status === "pending" ? "warning" :
                                                        "secondary"
                                            }>
                                                {booking.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 lg:justify-end">
                                            {isCompleted ? (
                                                <Link href={`/student/bookings/${booking.id}/review`}>
                                                    <Button size="sm" className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                                                        <Star className="h-3 w-3 mr-2 fill-current" />
                                                        Review
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Link href={`/classroom/${booking.id}`}>
                                                    <Button size="sm" disabled={booking.status !== "confirmed"}>
                                                        Enter Room
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-slate-500 italic">You haven&apos;t booked any lessons yet.</p>
                        <Link href="/tutors">
                            <Button variant="link" className="text-sky-400 mt-2">Browse expert tutors</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

import Link from "next/link";
import { Star, ShieldCheck, Video, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TutorCardProps = {
    tutor: {
        id: string;
        full_name: string;
        avatar_url: string | null;
        headline: string | null;
        about: string | null;
        hourly_rate: number;
        average_rating: number;
        rating_count: number;
        is_verified: boolean;
        languages_spoken?: any;
        subjects?: { name: string }[];
    };
};

export default function TutorCard({ tutor }: TutorCardProps) {
    return (
        <Card className="group overflow-hidden border-white/10 bg-slate-900/50 transition-all hover:border-sky-500/50 hover:bg-slate-900">
            <div className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-4">
                        <Avatar className="h-16 w-16 border-2 border-white/10">
                            <AvatarImage src={tutor.avatar_url ?? ""} alt={tutor.full_name} />
                            <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold">
                                {tutor.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                                    {tutor.full_name}
                                </h3>
                                {tutor.is_verified && (
                                    <ShieldCheck className="h-4 w-4 text-sky-400" />
                                )}
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-1">{tutor.headline}</p>
                            <div className="flex items-center gap-3 pt-1">
                                <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                                    <Star className="h-3 w-3 fill-current" />
                                    {tutor.average_rating > 0 ? tutor.average_rating.toFixed(1) : "New"}
                                    {tutor.rating_count > 0 && (
                                        <span className="text-slate-500 font-normal">({tutor.rating_count})</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                    <Video className="h-3 w-3" />
                                    <span>Trial available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-end justify-between sm:flex-col sm:items-end sm:justify-start">
                        <p className="text-2xl font-black text-white">
                            ${tutor.hourly_rate}
                            <span className="text-xs font-normal text-slate-500">/hr</span>
                        </p>
                        <Link
                            href={`/tutors/${tutor.id}`}
                            className="mt-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-sky-500 hover:text-slate-950"
                        >
                            View Profile
                        </Link>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-slate-300 line-clamp-2 italic">
                        &quot;{tutor.about}&quot;
                    </p>
                </div>

                {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {tutor.subjects.slice(0, 3).map((sub, i) => (
                            <Badge
                                key={i}
                                variant="outline"
                                className="border-white/5 bg-white/5 text-[10px] lowercase tracking-wider text-slate-400"
                            >
                                {sub.name}
                            </Badge>
                        ))}
                        {tutor.subjects.length > 3 && (
                            <span className="text-[10px] text-slate-600">+{tutor.subjects.length - 3} more</span>
                        )}
                    </div>
                )}
            </div>

            <div className="border-t border-white/5 bg-black/20 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>Next available: Tomorrow</span>
                </div>
                <Link
                    href={`/tutors/${tutor.id}/book`}
                    className="text-xs font-bold uppercase tracking-widest text-sky-400 hover:text-sky-300"
                >
                    Book Lesson
                </Link>
            </div>
        </Card>
    );
}

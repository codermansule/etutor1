"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, addMinutes, isSameDay, isAfter, isBefore } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type BookingCalendarProps = {
    availability: any[];
    onSelectSlot: (date: Date) => void;
    selectedDate: Date | null;
    tutorTimezone: string;
};

export default function BookingCalendar({
    availability,
    onSelectSlot,
    selectedDate,
    tutorTimezone
}: BookingCalendarProps) {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    // Generate 15-min slots for a day
    const generateTimeSlots = (date: Date) => {
        const dayIndex = date.getDay();
        const dateStr = format(date, "yyyy-MM-dd");

        // 1. Get recurring slots for this day of week
        const recurring = availability.filter(s => s.day_of_week === dayIndex);
        // 2. Get overrides for this specific date
        const overrides = availability.filter(s => s.specific_date === dateStr);

        const activeSlots = overrides.length > 0 ? overrides : recurring;

        if (activeSlots.length === 0) return [];

        const slots: Date[] = [];
        activeSlots.forEach(as => {
            const [startH, startM] = as.start_time.split(':').map(Number);
            const [endH, endM] = as.end_time.split(':').map(Number);

            let current = new Date(date);
            current.setHours(startH, startM, 0, 0);

            const end = new Date(date);
            end.setHours(endH, endM, 0, 0);

            while (isBefore(current, end)) {
                if (isAfter(current, new Date())) { // Only future slots
                    slots.push(new Date(current));
                }
                current = addMinutes(current, 60); // 1-hour lessons by default
            }
        });

        return slots.sort((a, b) => a.getTime() - b.getTime());
    };

    return (
        <Card className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl">
            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-white">Select a Time</h2>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                            {format(currentWeekStart, "MMMM yyyy")}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                            className="h-8 w-8 rounded-lg border-white/10 text-white hover:bg-white/5"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                            className="h-8 w-8 rounded-lg border-white/10 text-white hover:bg-white/5"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {weekDays.map((day, i) => {
                        const isToday = isSameDay(day, new Date());
                        const hasSlots = generateTimeSlots(day).length > 0;

                        return (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">
                                    {format(day, "EEE")}
                                </span>
                                <div className={`
                  flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all
                  ${isToday ? "bg-sky-500/20 text-sky-400 ring-1 ring-sky-500/50" : "text-slate-300"}
                  ${!hasSlots && "opacity-20 cursor-not-allowed"}
                `}>
                                    {format(day, "d")}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <Clock className="h-3 w-3" />
                            Available slots
                        </div>
                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {weekDays.map(day => {
                                const slots = generateTimeSlots(day);
                                if (slots.length === 0) return null;

                                return (
                                    <div key={day.toISOString()} className="space-y-2">
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest py-1 border-b border-white/5">
                                            {format(day, "EEEE, MMM d")}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {slots.map(slot => (
                                                <button
                                                    key={slot.toISOString()}
                                                    onClick={() => onSelectSlot(slot)}
                                                    className={`
                            rounded-xl py-2 px-3 text-xs font-bold transition-all
                            ${selectedDate?.getTime() === slot.getTime()
                                                            ? "bg-sky-500 text-slate-950 shadow-[0_0_20px_rgba(14,165,233,0.3)]"
                                                            : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"}
                          `}
                                                >
                                                    {format(slot, "HH:mm")}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-sky-500/5 border border-sky-500/10 p-5 space-y-4 h-fit">
                        <div className="flex items-start gap-3">
                            <Info className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">Timezone Info</p>
                                <p className="text-[10px] text-slate-400 leading-relaxed">
                                    Times are displayed in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone}).
                                    The tutor is located in {tutorTimezone}.
                                </p>
                            </div>
                        </div>
                        {selectedDate && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="pt-4 border-t border-sky-500/10"
                            >
                                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-2">Selected Lesson</p>
                                <p className="text-sm font-black text-white">
                                    {format(selectedDate, "EEEE, MMMM d")}
                                </p>
                                <p className="text-xl font-black text-white mt-1">
                                    {format(selectedDate, "HH:mm")} - {format(addMinutes(selectedDate, 60), "HH:mm")}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

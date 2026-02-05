"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    Plus,
    Trash2,
    Save,
    Calendar as CalendarIcon,
    Globe,
    AlertCircle,
    Loader2,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AvailabilitySlot = {
    id?: string;
    day_of_week: number | null;
    specific_date: string | null;
    start_time: string;
    end_time: string;
    timezone: string;
};

const DAYS = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export default function AvailabilityPage() {
    const supabase = createBrowserClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const [activeTab, setActiveTab] = useState<"weekly" | "overrides">("weekly");

    useEffect(() => {
        async function loadAvailability() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("availability")
                .select("*")
                .eq("tutor_id", user.id);

            if (data) {
                setSlots(data);
                if (data.length > 0) {
                    setTimezone(data[0].timezone);
                }
            }
            setLoading(false);
        }
        loadAvailability();
    }, [supabase]);

    const addSlot = (dayIndex: number | null = null, date: string | null = null) => {
        const newSlot: AvailabilitySlot = {
            day_of_week: dayIndex,
            specific_date: date,
            start_time: "09:00",
            end_time: "17:00",
            timezone: timezone,
        };
        setSlots([...slots, newSlot]);
    };

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
    };

    const updateSlot = (index: number, updates: Partial<AvailabilitySlot>) => {
        const newSlots = [...slots];
        newSlots[index] = { ...newSlots[index], ...updates };
        setSlots(newSlots);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user");

            // Simple implementation: delete all and re-insert
            // In production, you'd want a more sophisticated diffing approach
            await supabase.from("availability").delete().eq("tutor_id", user.id);

            const { error } = await supabase
                .from("availability")
                .insert(slots.map(s => ({
                    ...s,
                    tutor_id: user.id,
                    timezone: timezone
                })));

            if (error) throw error;
            alert("Availability saved successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save availability.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white">Availability</h1>
                    <p className="mt-1 text-sm text-slate-400 font-medium">Set your working hours and manage overrides.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-xs font-bold text-slate-300">
                        <Globe className="h-4 w-4 text-sky-400" />
                        {timezone}
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-sky-500 text-slate-950 hover:bg-sky-400"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("weekly")}
                    className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "weekly"
                            ? "bg-white text-slate-950"
                            : "bg-white/5 text-slate-500 hover:text-white"
                        }`}
                >
                    Weekly Schedule
                </button>
                <button
                    onClick={() => setActiveTab("overrides")}
                    className={`rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === "overrides"
                            ? "bg-white text-slate-950"
                            : "bg-white/5 text-slate-500 hover:text-white"
                        }`}
                >
                    Date Overrides
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "weekly" ? (
                    <motion.div
                        key="weekly"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid gap-6"
                    >
                        {DAYS.map((day, dayIndex) => {
                            const daySlots = slots.filter(s => s.day_of_week === dayIndex);
                            return (
                                <Card key={day} className="border-white/10 bg-slate-900/50 p-6 backdrop-blur-xl transition-all hover:bg-slate-900">
                                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-[120px]">
                                            <h3 className="text-lg font-bold text-white uppercase tracking-wider">{day}</h3>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {daySlots.length === 0 ? "Unavailable" : `${daySlots.length} active slots`}
                                            </p>
                                        </div>

                                        <div className="flex-1 space-y-3">
                                            {daySlots.map((slot, i) => {
                                                const globalIndex = slots.findIndex(s => s === slot);
                                                return (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <Input
                                                            type="time"
                                                            value={slot.start_time}
                                                            onChange={(e) => updateSlot(globalIndex, { start_time: e.target.value })}
                                                            className="w-32 bg-slate-950 border-white/10 text-white"
                                                        />
                                                        <span className="text-slate-500">to</span>
                                                        <Input
                                                            type="time"
                                                            value={slot.end_time}
                                                            onChange={(e) => updateSlot(globalIndex, { end_time: e.target.value })}
                                                            className="w-32 bg-slate-950 border-white/10 text-white"
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeSlot(globalIndex)}
                                                            className="text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                );
                                            })}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addSlot(dayIndex)}
                                                className="border-dashed border-white/10 hover:bg-white/5 text-sky-400"
                                            >
                                                <Plus className="h-3 w-3 mr-2" />
                                                Add Slot
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="overrides"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <Card className="border-white/10 bg-slate-900/50 p-8 backdrop-blur-xl">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-12 w-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                                    <AlertCircle className="h-6 w-6" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Manage Availability Overrides</h2>
                                <p className="text-sm text-slate-400 max-w-sm">
                                    Add specific dates where your schedule differs from your weekly routine (e.g., holidays, appointments).
                                </p>
                                <Button
                                    onClick={() => addSlot(null, new Date().toISOString().split('T')[0])}
                                    className="bg-white text-slate-950 hover:bg-slate-200"
                                >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    Add Specific Date Override
                                </Button>
                            </div>

                            <div className="mt-8 space-y-4">
                                {slots.filter(s => s.specific_date !== null).map((slot, i) => {
                                    const globalIndex = slots.findIndex(s => s === slot);
                                    return (
                                        <div key={i} className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                            <Input
                                                type="date"
                                                value={slot.specific_date!}
                                                onChange={(e) => updateSlot(globalIndex, { specific_date: e.target.value })}
                                                className="w-48 bg-slate-950 border-white/10 text-white"
                                            />
                                            <div className="flex items-center gap-3">
                                                <Input
                                                    type="time"
                                                    value={slot.start_time}
                                                    onChange={(e) => updateSlot(globalIndex, { start_time: e.target.value })}
                                                    className="w-32 bg-slate-950 border-white/10 text-white"
                                                />
                                                <span className="text-slate-500">to</span>
                                                <Input
                                                    type="time"
                                                    value={slot.end_time}
                                                    onChange={(e) => updateSlot(globalIndex, { end_time: e.target.value })}
                                                    className="w-32 bg-slate-950 border-white/10 text-white"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeSlot(globalIndex)}
                                                    className="text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralSectionProps {
    referralCode: string;
}

export default function ReferralSection({ referralCode }: ReferralSectionProps) {
    const [copied, setCopied] = useState(false);

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(referralCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = referralCode;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareLink = async () => {
        const url = `${window.location.origin}/register?ref=${referralCode}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Join me on SBETUTOR!",
                    text: `Use my referral code ${referralCode} to get started on SBETUTOR.`,
                    url,
                });
            } catch {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-950/50 border border-white/10 rounded-2xl px-5 py-4">
                <span className="text-xl font-black text-white tracking-[0.3em] flex-1 select-all">
                    {referralCode}
                </span>
                <button
                    onClick={copyCode}
                    className="text-slate-400 hover:text-sky-400 transition-colors p-1"
                    title="Copy code"
                >
                    {copied ? (
                        <Check className="h-5 w-5 text-emerald-400" />
                    ) : (
                        <Copy className="h-5 w-5" />
                    )}
                </button>
            </div>
            <Button
                onClick={shareLink}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-2xl h-14 px-6"
            >
                <Share2 className="h-4 w-4 mr-2" />
                Share
            </Button>
        </div>
    );
}

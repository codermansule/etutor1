import { format } from "date-fns";
import { motion } from "framer-motion";

type MessageBubbleProps = {
    content: string;
    isMine: boolean;
    timestamp: string;
};

export default function MessageBubble({ content, isMine, timestamp }: MessageBubbleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex flex-col ${isMine ? "items-end" : "items-start"} mb-4`}
        >
            <div
                className={`max-w-[80%] rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-xl ${isMine
                        ? "bg-gradient-to-br from-sky-500 to-cyan-400 text-slate-950 rounded-tr-none"
                        : "bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none"
                    }`}
            >
                {content}
            </div>
            <span className="text-[9px] text-slate-600 uppercase tracking-widest font-black mt-1.5 px-2">
                {format(new Date(timestamp), "HH:mm")}
            </span>
        </motion.div>
    );
}

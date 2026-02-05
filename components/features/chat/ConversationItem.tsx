import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ConversationItemProps = {
    active?: boolean;
    name: string;
    avatarUrl?: string | null;
    lastMessage?: string;
    timestamp?: string;
    isRead?: boolean;
    onClick: () => void;
};

export default function ConversationItem({
    active,
    name,
    avatarUrl,
    lastMessage,
    timestamp,
    isRead,
    onClick
}: ConversationItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 flex items-center gap-4 transition-all hover:bg-white/5 border-l-4 ${active
                ? "bg-sky-500/5 border-sky-500"
                : "border-transparent"
                }`}
        >
            <Avatar className="h-12 w-12 shrink-0 border border-white/10">
                <AvatarImage src={avatarUrl ?? ""} alt={name} />
                <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold">
                    {name[0].toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white truncate text-sm">{name}</h4>
                    {timestamp && (
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black shrink-0">
                            {format(new Date(timestamp), "HH:mm")}
                        </span>
                    )}
                </div>
                <p className={`text-xs truncate mt-0.5 ${!isRead && !active ? "text-white font-bold" : "text-slate-500"}`}>
                    {lastMessage || "Start a conversation..."}
                </p>
            </div>

            {!isRead && !active && (
                <div className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
            )}
        </button>
    );
}

import { Metadata } from "next";
import ChatInterface from "@/components/features/chat/ChatInterface";

export const metadata: Metadata = {
    title: "Messages | SBETUTOR",
    description: "Connect with your tutors and students.",
};

export default function MessagesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-white">
                    Inbox
                </h1>
                <p className="mt-1 text-sm text-slate-400 font-medium">
                    Manage your communications and stay updated.
                </p>
            </div>

            <ChatInterface />
        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Send, MoreVertical, Search, Smile, Paperclip, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConversationItem from "./ConversationItem";
import MessageBubble from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatInterface() {
    const supabase = createBrowserClient();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConversation, setActiveConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        async function loadInitialData() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (!user) return;

            // Fetch conversations
            const { data: convos } = await supabase
                .from("conversations")
                .select(`
          *,
          participant_1:participant_1_id (full_name, avatar_url),
          participant_2:participant_2_id (full_name, avatar_url)
        `)
                .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
                .order("last_message_at", { ascending: false });

            setConversations(convos || []);
            setLoading(false);
        }
        loadInitialData();

        // Subscribe to conversation updates
        const convoSub = supabase
            .channel("conversation_updates")
            .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
                loadInitialData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(convoSub);
        };
    }, [supabase]);

    useEffect(() => {
        if (!activeConversation) return;

        async function loadMessages() {
            const { data } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", activeConversation.id)
                .order("created_at", { ascending: true });

            setMessages(data || []);
        }
        loadMessages();

        // Subscribe to new messages
        const messageSub = supabase
            .channel(`room_${activeConversation.id}`)
            .on("postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConversation.id}` },
                (payload) => {
                    setMessages(prev => [...prev, payload.new]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(messageSub);
        };
    }, [activeConversation, supabase]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation || !user) return;

        const content = newMessage;
        setNewMessage("");

        const { error } = await supabase
            .from("messages")
            .insert({
                conversation_id: activeConversation.id,
                sender_id: user.id,
                content: content
            });

        if (error) console.error(error);
    };

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-160px)] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/50 backdrop-blur-xl">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-slate-900/30">
                <div className="p-4 border-b border-white/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <Input
                            placeholder="Search chats..."
                            className="bg-slate-950/50 border-white/5 pl-9 h-10 text-xs italic"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.length > 0 ? (
                        conversations.map((convo) => {
                            const otherUser = convo.participant_1_id === user?.id ? convo.participant_2 : convo.participant_1;
                            return (
                                <ConversationItem
                                    key={convo.id}
                                    active={activeConversation?.id === convo.id}
                                    name={otherUser?.full_name || "Unknown User"}
                                    avatarUrl={otherUser?.avatar_url}
                                    lastMessage={convo.last_message_text}
                                    timestamp={convo.last_message_at}
                                    isRead={true} // Simplified
                                    onClick={() => setActiveConversation(convo)}
                                />
                            );
                        })
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-xs text-slate-600 font-bold uppercase tracking-widest italic">No chats yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <h3 className="font-bold text-white text-sm">
                                    {activeConversation.participant_1_id === user?.id
                                        ? activeConversation.participant_2?.full_name
                                        : activeConversation.participant_1?.full_name}
                                </h3>
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-500">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    content={msg.content}
                                    isMine={msg.sender_id === user?.id}
                                    timestamp={msg.created_at}
                                />
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/50 border-t border-white/10">
                            <div className="relative flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Button type="button" variant="ghost" size="icon" className="text-slate-500 hover:text-sky-400">
                                        <Paperclip className="h-5 w-5" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="text-slate-500 hover:text-sky-400">
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                </div>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="bg-slate-950/80 border-white/5 h-12 rounded-2xl text-sm italic pr-12 focus-visible:ring-sky-500/50"
                                />
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="absolute right-1 top-1 h-10 w-10 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 p-0"
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-sky-500/5 flex items-center justify-center text-sky-500/20">
                            <MessageSquare className="h-10 w-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Your Workspace</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 italic">
                                Select a conversation to start messaging. Your messages are end-to-end encrypted in your imagination.
                            </p>
                        </div>
                        <Button variant="outline" className="border-white/10 text-white rounded-full px-8 italic">
                            New Message
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

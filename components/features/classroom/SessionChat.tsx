"use client";

import { useEffect, useRef, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Send, MessageSquare, X } from "lucide-react";

interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
}

interface SessionChatProps {
  sessionId: string;
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionChat({
  sessionId,
  userId,
  userName,
  isOpen,
  onClose,
}: SessionChatProps) {
  const supabase = createBrowserClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Load existing messages and subscribe to new ones
  useEffect(() => {
    if (!sessionId) return;

    // Fetch existing messages
    async function loadMessages() {
      const { data } = await supabase
        .from("session_chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    }

    loadMessages();

    // Subscribe to new messages via Realtime
    const channel = supabase
      .channel(`session-chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, supabase]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    // Optimistic update
    const optimisticMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      sender_id: userId,
      content: text,
      created_at: new Date().toISOString(),
      sender_name: userName,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const { error } = await supabase.from("session_chat_messages").insert({
      session_id: sessionId,
      sender_id: userId,
      content: text,
    });

    if (error) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      console.error("Failed to send message:", error);
    }

    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full w-80 border-l border-white/10 bg-slate-900/95 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            Chat
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-slate-500 text-xs text-center mt-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {!isMe && (
                <span className="text-[10px] text-slate-500 mb-0.5 font-medium">
                  {msg.sender_name || "Participant"}
                </span>
              )}
              <div
                className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-sky-500/20 text-sky-100 rounded-br-sm"
                    : "bg-white/10 text-slate-200 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[9px] text-slate-600 mt-0.5">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="text-sky-400 hover:text-sky-300 disabled:text-slate-600 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

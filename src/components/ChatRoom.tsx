import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, MessageSquare, Crown, Zap, ShieldAlert, Smile } from "lucide-react";
import { motion } from "motion/react";

interface ChatRoomProps {
  tournamentId: string;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  currentUser: { id: string; name: string } | null;
  organizerId: string;
}

export default function ChatRoom({ tournamentId, messages, onSendMessage, currentUser, organizerId }: ChatRoomProps) {
  const [typedMessage, setTypedMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !currentUser || isSending) return;

    try {
      setIsSending(true);
      await onSendMessage(typedMessage.trim());
      setTypedMessage("");
    } catch (err) {
      console.error("Chat send failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  const quickPhrases = ["BOOYAH! 🔥", "Sniper Master 🎯", "Room ID please? 🔑", "GG! WP 🤝", "Add me squad! 👾"];

  const getRoleBadge = (userId: string) => {
    if (userId === organizerId) {
      return (
        <span className="flex items-center gap-0.5 bg-red-600/15 text-red-400 border border-red-600/35 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
          <Crown className="w-2.5 h-2.5 shrink-0" /> Holder
        </span>
      );
    }
    return (
      <span className="flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
        <Zap className="w-2.5 h-2.5 shrink-0" /> Player
      </span>
    );
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden h-[500px] flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4.5 h-4.5 text-orange-500" />
          <h3 className="font-sans font-bold text-white text-sm uppercase tracking-wider">Lobby Group Chat</h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-medium font-mono uppercase tracking-widest flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Hub Room
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 p-6 space-y-2">
            <Smile className="w-10 h-10 text-zinc-700" />
            <p className="font-semibold text-zinc-400 text-sm">No messages yet</p>
            <p className="text-xs max-w-xs">Be the first to say something or recruit squad members in this live chat lobby!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMe = currentUser && message.userId === currentUser.id;
            const isOrganizer = message.userId === organizerId;

            return (
              <div 
                key={message.id} 
                className={`flex flex-col max-w-[85%] ${
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {/* Meta details */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-bold ${isMe ? "text-orange-400" : "text-zinc-400"}`}>
                    {message.userName}
                  </span>
                  {getRoleBadge(message.userId)}
                  <span className="text-[9px] text-zinc-600 font-mono">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Bubble */}
                <div 
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-medium leading-relaxed shadow-md ${
                    isMe 
                      ? "bg-gradient-to-br from-orange-600 to-orange-500 text-white rounded-tr-none" 
                      : isOrganizer
                      ? "bg-red-950/20 text-zinc-200 border border-red-900/30 rounded-tl-none"
                      : "bg-zinc-900 text-zinc-300 border border-zinc-850 rounded-tl-none"
                  }`}
                >
                  {message.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {currentUser && (
        <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-800/60 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-thin">
          {quickPhrases.map((phrase) => (
            <button
              key={phrase}
              onClick={() => {
                if (!isSending) {
                  onSendMessage(phrase);
                }
              }}
              disabled={isSending}
              className="text-[10px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-orange-400 font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer disabled:opacity-50"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}

      {/* Input section */}
      <div className="p-3 bg-zinc-900/80 border-t border-zinc-800">
        {currentUser ? (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              id="lobby-chat-input"
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              placeholder="Type message here..."
              className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-orange-500 text-xs text-white px-3.5 py-2 rounded-lg focus:outline-none transition-colors"
              maxLength={250}
              disabled={isSending}
            />
            <button
              id="send-chat-btn"
              type="submit"
              disabled={isSending || !typedMessage.trim()}
              className="px-3 py-2 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-lg transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <p className="text-[11px] text-zinc-500 text-center py-1.5 uppercase font-semibold tracking-wider flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-zinc-650" /> Please log in or generate gamer profile to chat
          </p>
        )}
      </div>
    </div>
  );
}

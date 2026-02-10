"use client";

import { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import type { SquadMessage } from "@/lib/types";
import { timeAgo, getAgent } from "@/lib/utils";

interface SquadChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SquadChatModal({ isOpen, onClose }: SquadChatModalProps) {
  const [messages, setMessages] = useState<SquadMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/ops/chat?limit=100");
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data.reverse());
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    try {
      await fetch("/api/ops/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: input.trim(),
          agent_id: "rob",
        }),
      });
      setInput("");
      await fetchMessages();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Squad Chat" wide>
      <div className="flex flex-col" style={{ height: "60vh" }}>
        {/* Message feed */}
        <div ref={feedRef} className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-[11px] text-[#9CA3AF]">
              <div className="text-2xl mb-2">💬</div>
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((m) => {
              const isRob = m.agent_id === "rob";
              const sender = isRob ? null : getAgent(m.agent_id);
              return (
                <div key={m.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#F5F4F0] flex items-center justify-center text-sm shrink-0 border border-[#E8E5E0]">
                    {isRob ? "👤" : sender?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-xs font-bold"
                        style={{ color: isRob ? "#E8952E" : sender?.color }}
                      >
                        {isRob ? "Rob" : sender?.name}
                      </span>
                      {isRob && <span className="text-[9px] text-[#9CA3AF]">Founder</span>}
                      <span className="text-[9px] text-[#9CA3AF]">{timeAgo(m.created_at)}</span>
                    </div>
                    <p className="text-xs text-[#2D2D2D] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t border-[#E8E5E0] pt-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1 px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-xs text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E]"
            placeholder="Message the squad... (enter to send)"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="px-4 py-2 text-[11px] font-bold rounded-lg bg-[#E8952E] text-white hover:bg-[#D4841F] disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </Modal>
  );
}

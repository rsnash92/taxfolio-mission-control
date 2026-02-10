"use client";

import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { getAgent } from "@/lib/utils";

interface MissionCreated {
  agent_id: string;
  title: string;
  mission_id: string;
  steps: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  missions_created?: MissionCreated[];
  timestamp: Date;
}

interface JarvisChatProps {
  isOpen: boolean;
  onClose: () => void;
  onMissionCreated?: () => void;
}

export default function JarvisChat({ isOpen, onClose, onMissionCreated }: JarvisChatProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey Rob. What are we working on today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ops/jarvis-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter((m) => m.id !== "welcome" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast(data.error, "error");
        return;
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
        missions_created: data.missions_created,
        timestamp: new Date(),
      };

      setMessages([...newMessages, assistantMsg]);

      if (data.missions_created?.length > 0) {
        onMissionCreated?.();
      }
    } catch {
      toast("Failed to reach Jarvis", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-[420px] max-w-full h-full bg-[#FAFAF8] border-l border-[#E8E5E0] shadow-lg flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#E8E5E0] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <div className="text-sm font-bold text-[#1A1A1A]">Jarvis</div>
              <div className="text-[10px] text-emerald-600 font-medium">Chief of Staff · Online</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#6B6B6B] hover:bg-[#F5F4F0] hover:text-[#1A1A1A] transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.role === "assistant" ? (
                <div className="flex gap-2 max-w-[90%]">
                  <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-xs shrink-0 mt-1">
                    🤖
                  </div>
                  <div>
                    <div className="bg-[#F5F0E8] rounded-lg rounded-tl-none px-3 py-2 text-xs text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    {msg.missions_created?.map((m) => {
                      const agent = getAgent(m.agent_id);
                      return (
                        <div
                          key={m.mission_id}
                          className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 mt-2"
                        >
                          <span className="text-sm">✅</span>
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold text-emerald-800 truncate">{m.title}</div>
                            <div className="text-[10px] text-emerald-600">
                              → <span style={{ color: agent.color }}>@{agent.name}</span> · {m.steps} steps
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-[9px] text-[#9CA3AF] mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[80%]">
                    <div className="bg-[#E8952E] text-white rounded-lg rounded-tr-none px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    <div className="text-[9px] text-[#9CA3AF] mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 max-w-[90%]">
              <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-xs shrink-0 mt-1">
                🤖
              </div>
              <div className="bg-[#F5F0E8] rounded-lg rounded-tl-none px-3 py-2.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#9CA3AF] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#E8E5E0] bg-white shrink-0">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message to Jarvis..."
              className="flex-1 px-3 py-2 text-xs bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-[#1A1A1A] resize-none focus:outline-none focus:border-[#E8952E] placeholder:text-[#9CA3AF]"
              style={{ minHeight: "36px", maxHeight: "96px" }}
              onInput={(e) => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = "36px";
                el.style.height = Math.min(el.scrollHeight, 96) + "px";
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-3 py-2 text-xs font-bold rounded-lg bg-[#E8952E] text-white hover:bg-[#D4841F] disabled:opacity-50 transition-colors shrink-0"
            >
              Send
            </button>
          </div>
          <div className="text-[9px] text-[#9CA3AF] mt-1.5">
            Press Enter to send · Shift+Enter for newline · Press J to toggle
          </div>
        </div>
      </div>
    </div>
  );
}

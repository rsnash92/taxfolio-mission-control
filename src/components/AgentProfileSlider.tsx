"use client";

import { useState, useEffect } from "react";
import SlideOver from "./SlideOver";
import { AGENTS } from "@/lib/agents";
import type { Mission, AgentEvent, SquadMessage } from "@/lib/types";
import { timeAgo, getAgent } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/agents";

interface AgentProfileSliderProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string | null;
  missions: Mission[];
  events: AgentEvent[];
}

type Tab = "attention" | "timeline" | "messages";

export default function AgentProfileSlider({ isOpen, onClose, agentId, missions, events }: AgentProfileSliderProps) {
  const [activeTab, setActiveTab] = useState<Tab>("attention");
  const [messages, setMessages] = useState<SquadMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [sending, setSending] = useState(false);

  const agent = agentId ? getAgent(agentId) : null;

  useEffect(() => {
    if (!isOpen || !agentId) return;
    fetch(`/api/ops/chat?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data.filter((m: SquadMessage) => m.agent_id === agentId || m.mentions?.includes(agentId)));
        }
      })
      .catch(() => {});
  }, [isOpen, agentId]);

  if (!agent || !agentId) return null;

  const isWorking = missions.some((m) => m.agent_id === agentId && m.status === "running");
  const agentMissions = missions.filter((m) => m.agent_id === agentId);
  const queuedSteps = agentMissions
    .flatMap((m) => (m.ops_mission_steps ?? []).map((s) => ({ ...s, missionTitle: m.title })))
    .filter((s) => s.status === "queued" || s.status === "running");
  const agentEvents = events.filter((e) => e.agent_id === agentId).slice(0, 30);

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    setSending(true);
    try {
      await fetch("/api/ops/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageInput.trim(),
          mentions: [agentId],
          agent_id: "rob",
        }),
      });
      setMessageInput("");
      const res = await fetch(`/api/ops/chat?limit=50`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data.filter((m: SquadMessage) => m.agent_id === agentId || m.mentions?.includes(agentId)));
      }
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "attention", label: "Attention" },
    { key: "timeline", label: "Timeline" },
    { key: "messages", label: "Messages" },
  ];

  return (
    <SlideOver isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <span className="text-3xl">{agent.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-[#1A1A1A]">{agent.name}</h3>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ color: agent.rankColor, background: `${agent.rankColor}15` }}
            >
              {agent.rank}
            </span>
          </div>
          <div className="text-xs text-[#6B6B6B] mb-1">{agent.role}</div>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isWorking ? "bg-emerald-500" : "bg-[#D4D1CC]"}`} />
            <span className={`text-[10px] font-medium ${isWorking ? "text-emerald-600" : "text-[#9CA3AF]"}`}>
              {isWorking ? "WORKING" : "IDLE"}
            </span>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="mb-5">
        <div className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">About</div>
        <p className="text-xs text-[#2D2D2D] leading-relaxed">{agent.about}</p>
      </div>

      {/* Skills */}
      <div className="mb-5">
        <div className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">Skills</div>
        <div className="flex flex-wrap gap-1.5">
          {agent.skills.map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F5F4F0] text-[#2D2D2D] border border-[#E8E5E0]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E8E5E0] mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-[11px] font-semibold border-b-2 transition-colors ${
              activeTab === tab.key
                ? "text-[#1A1A1A] border-[#E8952E]"
                : "text-[#6B6B6B] border-transparent hover:text-[#1A1A1A]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "attention" && (
          <div className="space-y-2">
            {queuedSteps.length === 0 ? (
              <div className="text-center py-8 text-[11px] text-[#9CA3AF]">No pending items</div>
            ) : (
              queuedSteps.map((step) => (
                <div key={step.id} className="bg-[#F5F4F0] rounded-lg p-3 border border-[#E8E5E0]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm" style={{ color: STATUS_COLORS[step.status] }}>
                      {step.status === "running" ? "\u25CF" : "\u25CB"}
                    </span>
                    <span className="text-xs font-semibold text-[#1A1A1A]">{step.title}</span>
                  </div>
                  <div className="text-[10px] text-[#6B6B6B]">{step.missionTitle}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-0">
            {agentEvents.length === 0 ? (
              <div className="text-center py-8 text-[11px] text-[#9CA3AF]">No recent events</div>
            ) : (
              agentEvents.map((e) => (
                <div key={e.id} className="flex gap-2 py-2 border-b border-[#F5F4F0] text-[11px]">
                  <div className="flex-1 min-w-0">
                    <div className="flex gap-1.5 items-center mb-0.5">
                      <span className="text-[9px] text-[#9CA3AF] bg-[#F5F4F0] px-1.5 py-0.5 rounded">{e.event_type}</span>
                    </div>
                    <div className="text-[#2D2D2D] leading-snug">{e.title}</div>
                  </div>
                  <span className="text-[9px] text-[#9CA3AF] shrink-0">{timeAgo(e.created_at)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-2">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-[11px] text-[#9CA3AF]">No messages yet</div>
            ) : (
              messages.map((m) => {
                const sender = getAgent(m.agent_id);
                return (
                  <div key={m.id} className="bg-[#F5F4F0] rounded-lg p-3 border border-[#E8E5E0]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold" style={{ color: m.agent_id === "rob" ? "#E8952E" : sender.color }}>
                        {m.agent_id === "rob" ? "Rob" : sender.name}
                      </span>
                      <span className="text-[9px] text-[#9CA3AF]">{timeAgo(m.created_at)}</span>
                    </div>
                    <p className="text-xs text-[#2D2D2D] leading-relaxed">{m.content}</p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Send Message */}
      <div className="mt-4 pt-4 border-t border-[#E8E5E0]">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1 px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-xs text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E]"
            placeholder={`Message ${agent.name}...`}
          />
          <button
            onClick={handleSendMessage}
            disabled={sending || !messageInput.trim()}
            className="px-3 py-2 text-[11px] font-bold rounded-lg bg-[#E8952E] text-white hover:bg-[#D4841F] disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </SlideOver>
  );
}

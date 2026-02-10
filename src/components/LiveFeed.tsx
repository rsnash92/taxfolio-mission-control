"use client";

import { useState } from "react";
import type { AgentEvent } from "@/lib/types";
import { timeAgo, getAgent } from "@/lib/utils";

const DECISION_TYPES = ["human_approved", "human_rejected", "mission_auto_approved", "proposal_pending"];
const SYSTEM_TYPES = ["heartbeat", "stale_recovery", "quota_rejected"];

interface LiveFeedProps {
  events: AgentEvent[];
}

export default function LiveFeed({ events }: LiveFeedProps) {
  const [feedFilter, setFeedFilter] = useState("All");

  const filtered = events.filter((e) => {
    if (feedFilter === "Decisions") return DECISION_TYPES.includes(e.event_type);
    if (feedFilter === "System") return SYSTEM_TYPES.includes(e.event_type);
    return true;
  });

  return (
    <aside className="w-80 bg-white border-l border-[#E8E5E0] flex flex-col shrink-0">
      <div className="px-3.5 py-2.5 border-b border-[#E8E5E0] flex items-center gap-2">
        <span className="font-bold text-sm text-[#1A1A1A]">Live Feed</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px] shadow-emerald-500" />
      </div>

      <div className="flex gap-1 px-3 py-1.5 border-b border-[#E8E5E0]">
        {["All", "Decisions", "System"].map((f) => (
          <button
            key={f}
            onClick={() => setFeedFilter(f)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
              feedFilter === f
                ? "bg-[#1A1A1A] text-white"
                : "text-[#6B6B6B] hover:text-[#1A1A1A]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-1.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[11px] text-[#9CA3AF]">
            <div className="text-2xl mb-2">📡</div>
            Events will appear here once agents start running
          </div>
        ) : (
          filtered.map((e) => {
            const agent = getAgent(e.agent_id);
            return (
              <div
                key={e.id}
                className="flex gap-2 py-2 border-b border-[#F5F4F0] text-[11px]"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                  style={{ background: agent.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex gap-1.5 items-center mb-0.5">
                    <span className="font-bold" style={{ color: agent.color }}>
                      @{agent.name}
                    </span>
                    <span className="text-[9px] text-[#9CA3AF]">{e.event_type}</span>
                  </div>
                  <div className="text-[#2D2D2D] leading-snug">{e.title}</div>
                </div>
                <span className="text-[9px] text-[#9CA3AF] shrink-0">
                  {timeAgo(e.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

"use client";

import { AGENTS } from "@/lib/agents";
import type { Mission } from "@/lib/types";

interface AgentSidebarProps {
  selectedAgent: string;
  onSelectAgent: (id: string) => void;
  onAgentProfile?: (id: string) => void;
  missions: Mission[];
}

export default function AgentSidebar({ selectedAgent, onSelectAgent, onAgentProfile, missions }: AgentSidebarProps) {
  const agentList = Object.values(AGENTS);

  return (
    <aside className="w-52 bg-[#F5F4F0] border-r border-[#E8E5E0] py-2.5 overflow-y-auto shrink-0">
      <div className="px-3 pb-2 text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider">
        Agents
      </div>

      <button
        onClick={() => onSelectAgent("all")}
        className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors ${
          selectedAgent === "all"
            ? "bg-white border-l-[3px] border-[#E8952E]"
            : "border-l-[3px] border-transparent hover:bg-white/60"
        }`}
      >
        <span className="text-sm">🌐</span>
        <div>
          <div className="text-[11px] font-semibold text-[#1A1A1A]">All Agents</div>
          <div className="text-[9px] text-[#6B6B6B]">View everything</div>
        </div>
      </button>

      {agentList.map((agent) => {
        const count = missions.filter((m) => m.agent_id === agent.id).length;
        const isWorking = missions.some(
          (m) => m.agent_id === agent.id && m.status === "running"
        );
        return (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors group ${
              selectedAgent === agent.id ? "bg-white" : "hover:bg-white/60"
            }`}
            style={{
              borderLeft: `3px solid ${selectedAgent === agent.id ? agent.color : "transparent"}`,
            }}
          >
            <span className="text-sm">{agent.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#1A1A1A]">{agent.name}</span>
                  <span
                    className="text-[8px] font-bold px-1 py-0.5 rounded"
                    style={{ color: agent.rankColor, background: `${agent.rankColor}15` }}
                  >
                    {agent.rank}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {count > 0 && (
                    <span className="text-[9px] text-[#6B6B6B] bg-[#E8E5E0] px-1.5 rounded-full">
                      {count}
                    </span>
                  )}
                  {onAgentProfile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAgentProfile(agent.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-[#6B6B6B] hover:text-[#1A1A1A] transition-all"
                      title="View profile"
                    >
                      ℹ️
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-[#6B6B6B] truncate">{agent.role}</span>
                <span className="flex items-center gap-0.5 shrink-0">
                  <span
                    className={`w-1 h-1 rounded-full ${isWorking ? "bg-emerald-500" : "bg-[#D4D1CC]"}`}
                  />
                  <span className={`text-[8px] font-medium ${isWorking ? "text-emerald-600" : "text-[#9CA3AF]"}`}>
                    {isWorking ? "WORKING" : "IDLE"}
                  </span>
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </aside>
  );
}

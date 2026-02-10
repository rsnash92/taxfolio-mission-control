"use client";

import { AGENTS } from "@/lib/agents";
import type { Mission } from "@/lib/types";

interface AgentSidebarProps {
  selectedAgent: string;
  onSelectAgent: (id: string) => void;
  missions: Mission[];
}

export default function AgentSidebar({ selectedAgent, onSelectAgent, missions }: AgentSidebarProps) {
  const agentList = Object.values(AGENTS);

  return (
    <aside className="w-52 bg-slate-800 border-r border-slate-700 py-2.5 overflow-y-auto shrink-0">
      <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        Agents
      </div>

      <button
        onClick={() => onSelectAgent("all")}
        className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors ${
          selectedAgent === "all"
            ? "bg-slate-700 border-l-[3px] border-blue-500"
            : "border-l-[3px] border-transparent hover:bg-slate-800/50"
        }`}
      >
        <span className="text-sm">🌐</span>
        <div>
          <div className="text-[11px] font-semibold text-slate-100">All Agents</div>
          <div className="text-[9px] text-slate-500">View everything</div>
        </div>
      </button>

      {agentList.map((agent) => {
        const count = missions.filter((m) => m.agent_id === agent.id).length;
        return (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent.id)}
            className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors ${
              selectedAgent === agent.id
                ? "bg-slate-700"
                : "hover:bg-slate-800/50"
            }`}
            style={{
              borderLeft: `3px solid ${selectedAgent === agent.id ? agent.color : "transparent"}`,
            }}
          >
            <span className="text-sm">{agent.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold text-slate-100">{agent.name}</span>
                {count > 0 && (
                  <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-500 truncate">{agent.role}</div>
            </div>
          </button>
        );
      })}
    </aside>
  );
}

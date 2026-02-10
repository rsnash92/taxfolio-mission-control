"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { AGENTS } from "@/lib/agents";
import { timeAgo } from "@/lib/utils";

interface AgentStatus {
  agent_id: string;
  is_active: boolean;
  paused_at: string | null;
  reason: string | null;
  updated_at: string;
}

const AGENT_ORDER = ["system", "jarvis", "analyst", "scout", "writer", "growth", "reviewer", "dev"];

export default function AgentControls() {
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetch("/api/ops/agent-status")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAgents(data);
      })
      .catch(() => {})
      .finally(() => setInitialLoad(false));
  }, []);

  const toggleAgent = async (agentId: string, currentState: boolean) => {
    setLoading(agentId);
    try {
      const res = await fetch("/api/ops/agent-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: agentId, is_active: !currentState }),
      });
      const updated = await res.json();
      if (updated.agent_id) {
        setAgents((prev) => prev.map((a) => (a.agent_id === agentId ? updated : a)));
        toast(`${agentId} ${!currentState ? "resumed" : "paused"}`, "success");
      }
    } catch {
      toast("Failed to update", "error");
    } finally {
      setLoading(null);
    }
  };

  const sorted = AGENT_ORDER.map((id) => agents.find((a) => a.agent_id === id)).filter(Boolean) as AgentStatus[];
  const systemAgent = sorted.find((a) => a.agent_id === "system");
  const individualAgents = sorted.filter((a) => a.agent_id !== "system");
  const shieldPaused = agents.find((a) => a.agent_id === "reviewer")?.is_active === false;

  if (initialLoad) {
    return (
      <section className="bg-white rounded-lg p-5 border border-[#E8E5E0] shadow-sm">
        <div className="text-center py-6 text-[#6B6B6B] text-sm">Loading agent controls...</div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-lg p-5 border border-[#E8E5E0] shadow-sm">
      <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">Agent Controls</h2>

      {/* Kill switch */}
      {systemAgent && (
        <div
          className={`flex items-center justify-between p-3 rounded-lg border mb-4 ${
            systemAgent.is_active
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">{systemAgent.is_active ? "\u{1F7E2}" : "\u{1F534}"}</span>
            <div>
              <div className="text-xs font-bold text-[#1A1A1A]">Kill Switch (All Agents)</div>
              <div className="text-[10px] text-[#6B6B6B]">
                {systemAgent.is_active ? "System is active" : `Paused ${systemAgent.paused_at ? timeAgo(systemAgent.paused_at) : ""}`}
              </div>
            </div>
          </div>
          <button
            onClick={() => toggleAgent("system", systemAgent.is_active)}
            disabled={loading === "system"}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              systemAgent.is_active ? "bg-emerald-500" : "bg-red-400"
            } ${loading === "system" ? "opacity-50" : ""}`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                systemAgent.is_active ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      )}

      {/* Individual agents */}
      <div className="space-y-1.5">
        {individualAgents.map((agent) => {
          const info = AGENTS[agent.agent_id as keyof typeof AGENTS];
          return (
            <div
              key={agent.agent_id}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#F5F4F0] transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-sm">{info?.icon || "\u{1F916}"}</span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#1A1A1A]">
                    {info?.name || agent.agent_id}
                    <span className="text-[10px] font-normal text-[#6B6B6B] ml-1">
                      ({info?.role || agent.agent_id})
                    </span>
                  </div>
                  {!agent.is_active && agent.paused_at && (
                    <div className="text-[9px] text-red-400">
                      Paused {timeAgo(agent.paused_at)}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleAgent(agent.agent_id, agent.is_active)}
                disabled={loading === agent.agent_id}
                className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                  agent.is_active ? "bg-emerald-500" : "bg-[#D4D1CC]"
                } ${loading === agent.agent_id ? "opacity-50" : ""}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    agent.is_active ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {shieldPaused && (
        <div className="mt-3 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          {"\u26A0\uFE0F"} Shield is paused — content will not be reviewed before reaching your approval queue
        </div>
      )}
    </section>
  );
}

"use client";

import type { Mission } from "@/lib/types";
import { COLUMNS } from "@/lib/constants";
import MissionCard from "./MissionCard";

interface KanbanBoardProps {
  missions: Mission[];
  selectedAgent: string;
  onMissionClick?: (mission: Mission) => void;
}

export default function KanbanBoard({ missions, selectedAgent, onMissionClick }: KanbanBoardProps) {
  const filtered = missions.filter(
    (m) => selectedAgent === "all" || m.agent_id === selectedAgent
  );

  return (
    <div className="flex-1 p-4 overflow-x-auto overflow-y-hidden">
      <div className="flex gap-3 h-full">
        {COLUMNS.map((col) => {
          const colMissions = filtered.filter((m) => m.status === col.key);
          return (
            <div key={col.key} className="flex-1 min-w-[240px] flex flex-col">
              <div className="flex items-center gap-2 mb-2.5 px-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: col.color }}
                />
                <span className="text-xs font-semibold text-slate-300">{col.label}</span>
                <span className="text-[11px] text-slate-500">{colMissions.length}</span>
              </div>

              <div className="flex-1 bg-slate-800 rounded-lg p-2 overflow-y-auto border border-slate-700">
                {colMissions.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-slate-600">
                    No missions
                  </div>
                ) : (
                  colMissions.map((m) => (
                    <MissionCard
                      key={m.id}
                      mission={m}
                      onClick={() => onMissionClick?.(m)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

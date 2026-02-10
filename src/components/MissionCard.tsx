"use client";

import type { Mission } from "@/lib/types";
import { PRIORITY_COLORS } from "@/lib/agents";
import { timeAgo, getAgent } from "@/lib/utils";

interface MissionCardProps {
  mission: Mission;
  onClick?: () => void;
}

export default function MissionCard({ mission, onClick }: MissionCardProps) {
  const agent = getAgent(mission.agent_id);
  const steps = mission.ops_mission_steps ?? [];
  const doneSteps = steps.filter((s) => s.status === "succeeded").length;

  return (
    <div
      onClick={onClick}
      className="bg-slate-900 rounded-lg p-3 mb-2 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
    >
      <div className="flex items-start gap-1.5 mb-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
          style={{ background: PRIORITY_COLORS[mission.priority] }}
        />
        <span className="text-xs font-semibold text-slate-100 leading-tight">
          {mission.title}
        </span>
      </div>

      {mission.description && (
        <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">
          {mission.description}
        </p>
      )}

      {steps.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(doneSteps / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-500">
            {doneSteps}/{steps.length}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-2">
        {(mission.tags ?? []).map((t) => (
          <span
            key={t}
            className="text-[9px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded font-medium"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ color: agent.color, background: `${agent.color}15` }}
        >
          @{agent.name}
        </span>
        <span className="text-[10px] text-slate-600">
          {timeAgo(mission.created_at)}
        </span>
      </div>
    </div>
  );
}

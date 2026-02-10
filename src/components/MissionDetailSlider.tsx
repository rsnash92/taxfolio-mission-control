"use client";

import SlideOver from "./SlideOver";
import type { Mission } from "@/lib/types";
import { PRIORITY_COLORS, STATUS_COLORS } from "@/lib/agents";
import { timeAgo, getAgent } from "@/lib/utils";

interface MissionDetailSliderProps {
  isOpen: boolean;
  onClose: () => void;
  mission: Mission | null;
}

export default function MissionDetailSlider({ isOpen, onClose, mission }: MissionDetailSliderProps) {
  if (!mission) return null;

  const agent = getAgent(mission.agent_id);
  const steps = (mission.ops_mission_steps ?? []).sort((a, b) => a.step_order - b.step_order);

  const statusLabel: Record<string, string> = {
    queued: "Queued",
    running: "In Progress",
    succeeded: "Done",
    failed: "Failed",
    cancelled: "Cancelled",
  };

  const stepStatusIcon: Record<string, string> = {
    queued: "\u25CB",
    running: "\u25CF",
    succeeded: "\u2713",
    failed: "\u2717",
  };

  return (
    <SlideOver isOpen={isOpen} onClose={onClose} title="Mission Detail">
      <div className="mb-5">
        <h3 className="text-base font-bold text-[#1A1A1A] mb-2">{mission.title}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ color: STATUS_COLORS[mission.status], background: `${STATUS_COLORS[mission.status]}20` }}
          >
            {statusLabel[mission.status] ?? mission.status}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded capitalize"
            style={{ color: PRIORITY_COLORS[mission.priority], background: `${PRIORITY_COLORS[mission.priority]}20` }}
          >
            {mission.priority}
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded"
            style={{ color: agent.color, background: `${agent.color}20` }}
          >
            {agent.icon} {agent.name}
          </span>
        </div>
        {mission.description && (
          <p className="text-xs text-[#6B6B6B] leading-relaxed">{mission.description}</p>
        )}
      </div>

      <div className="mb-5 text-[10px] text-[#6B6B6B] space-y-1">
        <div>Created: {timeAgo(mission.created_at)}</div>
        {mission.completed_at && <div>Completed: {timeAgo(mission.completed_at)}</div>}
      </div>

      {mission.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-5">
          {mission.tags.map((t) => (
            <span
              key={t}
              className="text-[9px] bg-[#F5F4F0] text-[#6B6B6B] px-1.5 py-0.5 rounded font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div>
        <div className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">
          Steps ({steps.filter((s) => s.status === "succeeded").length}/{steps.length})
        </div>
        <div className="space-y-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-start gap-3 bg-[#F5F4F0] rounded-lg p-3 border border-[#E8E5E0]"
            >
              <span
                className="text-sm mt-0.5"
                style={{ color: STATUS_COLORS[step.status] ?? "#64748B" }}
              >
                {stepStatusIcon[step.status] ?? "\u25CB"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#1A1A1A]">{step.title}</span>
                  <span className="text-[9px] bg-[#E8E5E0] text-[#6B6B6B] px-1.5 py-0.5 rounded">
                    {step.kind.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="text-[10px] text-[#6B6B6B] mt-0.5 capitalize">
                  {step.status}
                </div>
              </div>
              <span className="text-[10px] text-[#9CA3AF]">{step.step_order + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </SlideOver>
  );
}

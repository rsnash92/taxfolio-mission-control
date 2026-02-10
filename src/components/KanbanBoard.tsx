"use client";

import { useState, useRef } from "react";
import type { Mission, Proposal, Approval } from "@/lib/types";
import { COLUMNS } from "@/lib/constants";
import MissionCard from "./MissionCard";
import ProposalCard from "./ProposalCard";
import { timeAgo, getAgent } from "@/lib/utils";
import { VERDICT_STYLES, TYPE_ICONS } from "@/lib/constants";

interface KanbanBoardProps {
  missions: Mission[];
  proposals: Proposal[];
  approvals: Approval[];
  selectedAgent: string;
  onMissionClick?: (mission: Mission) => void;
}

const FILTER_PILLS = [
  { key: "all", label: "All" },
  { key: "inbox", label: "Inbox" },
  { key: "assigned", label: "Assigned" },
  { key: "in_progress", label: "Active" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" },
] as const;

export default function KanbanBoard({
  missions,
  proposals,
  approvals,
  selectedAgent,
  onMissionClick,
}: KanbanBoardProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredMissions = missions.filter(
    (m) => selectedAgent === "all" || m.agent_id === selectedAgent
  );
  const filteredProposals = proposals.filter(
    (p) => p.status === "pending" && (selectedAgent === "all" || p.agent_id === selectedAgent)
  );

  const getColumnItems = (col: typeof COLUMNS[number]) => {
    if (col.source === "proposals") {
      return { proposals: filteredProposals, missions: [], approvals: [] };
    }
    if (col.source === "approvals") {
      return { proposals: [], missions: [], approvals };
    }
    const statusMap: Record<string, string> = {
      assigned: "queued",
      in_progress: "running",
      done: "succeeded",
    };
    const status = statusMap[col.key];
    return {
      proposals: [],
      missions: filteredMissions.filter((m) => m.status === status),
      approvals: [],
    };
  };

  const counts: Record<string, number> = {};
  COLUMNS.forEach((col) => {
    const items = getColumnItems(col);
    counts[col.key] = items.proposals.length + items.missions.length + items.approvals.length;
  });
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  const handleFilterClick = (key: string) => {
    setActiveFilter(key);
    if (key !== "all" && scrollRef.current) {
      const colEl = scrollRef.current.querySelector(`[data-col="${key}"]`);
      colEl?.scrollIntoView({ behavior: "smooth", inline: "start" });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filter pills */}
      <div className="flex gap-1.5 px-4 py-2.5 border-b border-[#E8E5E0] bg-white shrink-0">
        {FILTER_PILLS.map((pill) => {
          const count = pill.key === "all" ? totalCount : (counts[pill.key] ?? 0);
          const isActive = activeFilter === pill.key;
          return (
            <button
              key={pill.key}
              onClick={() => handleFilterClick(pill.key)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors flex items-center gap-1 ${
                isActive
                  ? "bg-[#E8952E] text-white"
                  : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
              }`}
            >
              {pill.label}
              <span className={`${isActive ? "text-white/80" : "text-[#9CA3AF]"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban columns */}
      <div className="flex-1 p-4 overflow-x-auto overflow-y-hidden" ref={scrollRef}>
        <div className="flex gap-3 h-full">
          {COLUMNS.map((col) => {
            const items = getColumnItems(col);
            const itemCount = items.proposals.length + items.missions.length + items.approvals.length;

            return (
              <div key={col.key} data-col={col.key} className="flex-1 min-w-[220px] flex flex-col">
                <div className="flex items-center gap-2 mb-2.5 px-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: col.color }}
                  />
                  <span className="text-xs font-semibold text-[#2D2D2D]">{col.label}</span>
                  <span className="text-[11px] text-[#9CA3AF]">{itemCount}</span>
                </div>

                <div className="flex-1 bg-[#F5F4F0] rounded-lg p-2 overflow-y-auto border border-[#E8E5E0]">
                  {itemCount === 0 ? (
                    <div className="text-center py-8 text-[11px] text-[#9CA3AF]">
                      No items
                    </div>
                  ) : (
                    <>
                      {items.proposals.map((p) => (
                        <ProposalCard key={p.id} proposal={p} />
                      ))}
                      {items.missions.map((m) => (
                        <MissionCard
                          key={m.id}
                          mission={m}
                          onClick={() => onMissionClick?.(m)}
                        />
                      ))}
                      {items.approvals.map((a) => (
                        <CompactApprovalCard key={a.id} approval={a} />
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CompactApprovalCard({ approval }: { approval: Approval }) {
  const agent = getAgent(approval.deliverable_type === "dev_deliverable" ? "dev" : "writer");
  const verdict = approval.ops_review_reports?.verdict ?? "pass";
  const v = VERDICT_STYLES[verdict] ?? VERDICT_STYLES.pass;

  return (
    <div className="bg-white rounded-lg p-3 mb-2 border border-[#E8E5E0] shadow-sm">
      <div className="flex items-start gap-1.5 mb-1.5">
        <span className="text-sm shrink-0">
          {TYPE_ICONS[approval.deliverable_type] ?? "\u{1F4C4}"}
        </span>
        <span className="text-xs font-semibold text-[#1A1A1A] leading-tight">
          {approval.title}
        </span>
      </div>
      <div className="flex gap-1.5 mb-2">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: v.bg, color: v.color }}
        >
          {v.label}
        </span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ color: agent.color, background: `${agent.color}15` }}
        >
          @{agent.name}
        </span>
      </div>
      <span className="text-[10px] text-[#9CA3AF]">
        {timeAgo(approval.created_at)}
      </span>
    </div>
  );
}

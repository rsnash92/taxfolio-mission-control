"use client";

import type { Proposal } from "@/lib/types";
import { PRIORITY_COLORS } from "@/lib/agents";
import { timeAgo, getAgent } from "@/lib/utils";

interface ProposalCardProps {
  proposal: Proposal;
  onClick?: () => void;
}

export default function ProposalCard({ proposal, onClick }: ProposalCardProps) {
  const agent = getAgent(proposal.agent_id);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-3 mb-2 border border-[#E8E5E0] hover:border-[#D4D1CC] transition-colors cursor-pointer shadow-sm"
    >
      <div className="flex items-start gap-1.5 mb-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
          style={{ background: PRIORITY_COLORS[proposal.priority] }}
        />
        <span className="text-xs font-semibold text-[#1A1A1A] leading-tight">
          {proposal.title}
        </span>
      </div>

      {proposal.description && (
        <p className="text-[11px] text-[#6B6B6B] mb-2 line-clamp-2">
          {proposal.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-2">
        <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium border border-amber-200">
          {proposal.source}
        </span>
        {(proposal.tags ?? []).map((t) => (
          <span
            key={t}
            className="text-[9px] bg-[#F5F4F0] text-[#6B6B6B] px-1.5 py-0.5 rounded font-medium"
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
        <span className="text-[10px] text-[#9CA3AF]">
          {timeAgo(proposal.created_at)}
        </span>
      </div>
    </div>
  );
}

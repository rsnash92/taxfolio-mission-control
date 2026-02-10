"use client";

import { useState, useEffect, useRef } from "react";
import type { Approval } from "@/lib/types";
import { VERDICT_STYLES, TYPE_ICONS } from "@/lib/constants";
import { timeAgo, getAgent } from "@/lib/utils";

interface ApprovalCardProps {
  approval: Approval;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDeliverable: (table: string, id: string) => void;
  onRejectWithNotes: (id: string, title: string) => void;
}

export default function ApprovalCard({ approval, onApprove, onReject, onViewDeliverable, onRejectWithNotes }: ApprovalCardProps) {
  const agent = getAgent(approval.deliverable_type === "dev_deliverable" ? "dev" : "writer");
  const verdict = approval.ops_review_reports?.verdict ?? "pass";
  const v = VERDICT_STYLES[verdict] ?? VERDICT_STYLES.pass;
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleApproveClick = () => {
    if (confirming) {
      onApprove(approval.id);
      setConfirming(false);
    } else {
      setConfirming(true);
      timerRef.current = setTimeout(() => setConfirming(false), 3000);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {TYPE_ICONS[approval.deliverable_type] ?? "\u{1F4C4}"}
          </span>
          <div>
            <div className="text-sm font-bold text-slate-100">{approval.title}</div>
            <div className="flex gap-2 mt-1.5 items-center">
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ color: agent.color, background: `${agent.color}20` }}
              >
                {agent.icon} {agent.name}
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: v.bg, color: v.color }}
              >
                🛡️ {v.label}
              </span>
            </div>
          </div>
        </div>
        <span className="text-[10px] text-slate-500">
          {timeAgo(approval.created_at)}
        </span>
      </div>

      {approval.summary && (
        <div className="bg-slate-900 rounded-md p-3 mb-4 border-l-[3px] border-slate-600">
          <span className="text-[10px] text-slate-500 font-semibold">
            SHIELD SUMMARY:
          </span>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {approval.summary}
          </p>
        </div>
      )}

      <div className="flex gap-2 justify-between">
        <button
          onClick={() => onViewDeliverable(approval.deliverable_table, approval.deliverable_id)}
          className="px-3 py-1.5 text-[11px] font-semibold rounded-md text-slate-400 hover:text-slate-200 bg-slate-700 hover:bg-slate-600 transition-colors"
        >
          View Full
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onRejectWithNotes(approval.id, approval.title)}
            className="px-3.5 py-1.5 text-[11px] font-semibold rounded-md bg-red-900/20 border border-red-900/40 text-red-300 hover:bg-red-900/30 transition-colors"
          >
            ✗ Reject
          </button>
          <button
            onClick={handleApproveClick}
            className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-colors ${
              confirming
                ? "bg-amber-600 text-white hover:bg-amber-500"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            {confirming ? "Confirm?" : "✓ Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

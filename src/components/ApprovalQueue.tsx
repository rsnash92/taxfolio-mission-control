"use client";

import { useState } from "react";
import type { Approval } from "@/lib/types";
import ApprovalCard from "./ApprovalCard";
import DeliverableModal from "./DeliverableModal";
import RejectModal from "./RejectModal";

interface ApprovalQueueProps {
  approvals: Approval[];
  loading: boolean;
  onApproval: (id: string, action: "approved" | "rejected", notes?: string) => void;
}

export default function ApprovalQueue({ approvals, loading, onApproval }: ApprovalQueueProps) {
  const [deliverable, setDeliverable] = useState<{ table: string; id: string } | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string; title: string } | null>(null);

  return (
    <div className="flex-1 p-5 overflow-y-auto">
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading...</div>
      ) : approvals.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">✅</div>
          <div className="text-base font-semibold text-slate-400">All clear</div>
          <div className="text-xs text-slate-500 mt-1">No items awaiting your approval</div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-3">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-100">Awaiting Your Approval</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reviewed by Shield — needs your sign-off before going live.
            </p>
          </div>

          {approvals.map((item) => (
            <ApprovalCard
              key={item.id}
              approval={item}
              onApprove={(id) => onApproval(id, "approved")}
              onReject={(id) => onApproval(id, "rejected")}
              onViewDeliverable={(table, id) => setDeliverable({ table, id })}
              onRejectWithNotes={(id, title) => setRejectTarget({ id, title })}
            />
          ))}
        </div>
      )}

      <DeliverableModal
        isOpen={!!deliverable}
        onClose={() => setDeliverable(null)}
        table={deliverable?.table ?? ""}
        id={deliverable?.id ?? ""}
      />

      <RejectModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        title={rejectTarget?.title ?? ""}
        onReject={(notes) => {
          if (rejectTarget) onApproval(rejectTarget.id, "rejected", notes);
          setRejectTarget(null);
        }}
      />
    </div>
  );
}

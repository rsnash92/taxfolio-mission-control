"use client";

import { useState, useEffect } from "react";
import type { ContentDraft } from "@/lib/types";
import { timeAgo, getAgent } from "@/lib/utils";
import SlideOver from "@/components/SlideOver";
import { useToast } from "@/components/Toast";

const STATUS_FILTERS = ["all", "draft", "review", "approved", "published", "rejected"];
const TYPE_FILTERS = ["all", "blog_post", "tax_guide", "email", "landing_page"];

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-[#F5F4F0] text-[#6B6B6B]",
  review: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  published: "bg-blue-50 text-blue-700 border border-blue-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

export default function ContentPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ContentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<ContentDraft | null>(null);

  const fetchContent = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("content_type", typeFilter);
      const res = await fetch(`/api/ops/content?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [statusFilter, typeFilter]);

  const handleAction = async (id: string, status: string) => {
    try {
      await fetch("/api/ops/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      toast(`Content ${status}`, "success");
      setSelectedItem(null);
      fetchContent();
    } catch {
      toast("Action failed", "error");
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8E5E0] bg-white shrink-0">
        <h1 className="text-base font-bold text-[#1A1A1A] mb-3">Content Review</h1>
        {/* Status filters */}
        <div className="flex gap-1.5 mb-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors capitalize ${
                statusFilter === f
                  ? "bg-[#E8952E] text-white"
                  : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Type filters */}
        <div className="flex gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                typeFilter === f
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
              }`}
            >
              {f === "all" ? "All Types" : f.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="text-center py-16 text-[#6B6B6B] text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📝</div>
            <div className="text-base font-semibold text-[#6B6B6B]">No content drafts</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Content will appear here when agents create drafts</div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            {items.map((item) => {
              const agent = getAgent(item.agent_id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-lg p-4 border border-[#E8E5E0] hover:border-[#D4D1CC] cursor-pointer shadow-sm transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">{item.title}</h3>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${STATUS_BADGE[item.status] ?? STATUS_BADGE.draft}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[#6B6B6B]">
                    <span className="bg-[#F5F4F0] px-1.5 py-0.5 rounded capitalize">{item.content_type?.replace(/_/g, " ")}</span>
                    <span style={{ color: agent.color }} className="font-semibold">@{agent.name}</span>
                    <span>{item.word_count ?? 0} words</span>
                    <span>{timeAgo(item.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail slide-over */}
      <SlideOver isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.title ?? "Content"}>
        {selectedItem && (
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${STATUS_BADGE[selectedItem.status] ?? STATUS_BADGE.draft}`}>
                {selectedItem.status}
              </span>
              <span className="text-[9px] bg-[#F5F4F0] px-1.5 py-0.5 rounded capitalize text-[#6B6B6B]">
                {selectedItem.content_type?.replace(/_/g, " ")}
              </span>
              <span className="text-[9px] text-[#6B6B6B]">{selectedItem.word_count ?? 0} words</span>
            </div>
            <div className="bg-[#F5F4F0] rounded-lg p-4 border border-[#E8E5E0] max-h-[50vh] overflow-y-auto mb-4">
              <div className="text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-wrap">{selectedItem.body}</div>
            </div>
            {(selectedItem.status === "review" || selectedItem.status === "draft") && (
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => handleAction(selectedItem.id, "rejected")}
                  className="px-3.5 py-1.5 text-[11px] font-semibold rounded-md bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(selectedItem.id, "approved")}
                  className="px-4 py-1.5 text-[11px] font-bold rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        )}
      </SlideOver>
    </div>
  );
}

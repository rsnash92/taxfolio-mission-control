"use client";

import { useState, useEffect } from "react";
import type { HmrcUpdate } from "@/lib/types";
import { timeAgo, getAgent } from "@/lib/utils";

const URGENCY_FILTERS = ["all", "critical", "high", "medium", "low"];

const URGENCY_STYLE: Record<string, { badge: string; border: string }> = {
  critical: { badge: "bg-red-50 text-red-700 border border-red-200", border: "border-l-red-500" },
  high: { badge: "bg-amber-50 text-amber-700 border border-amber-200", border: "border-l-amber-500" },
  medium: { badge: "bg-blue-50 text-blue-700 border border-blue-200", border: "border-l-blue-500" },
  low: { badge: "bg-[#F5F4F0] text-[#6B6B6B]", border: "border-l-[#D4D1CC]" },
};

export default function HmrcPage() {
  const [items, setItems] = useState<HmrcUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (urgencyFilter !== "all") params.set("urgency", urgencyFilter);
    fetch(`/api/ops/hmrc?${params}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [urgencyFilter]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8E5E0] bg-white shrink-0">
        <h1 className="text-base font-bold text-[#1A1A1A] mb-3">HMRC Tracker</h1>
        <div className="flex gap-1.5">
          {URGENCY_FILTERS.map((u) => (
            <button
              key={u}
              onClick={() => setUrgencyFilter(u)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors capitalize ${
                urgencyFilter === u
                  ? "bg-[#E8952E] text-white"
                  : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
              }`}
            >
              {u === "all" ? "All" : u}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="text-center py-16 text-[#6B6B6B] text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🏛️</div>
            <div className="text-base font-semibold text-[#6B6B6B]">No HMRC updates</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Updates will appear here when Sentinel detects changes</div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {items.map((item) => {
              const agent = getAgent(item.agent_id);
              const style = URGENCY_STYLE[item.urgency] ?? URGENCY_STYLE.low;
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-lg p-4 border border-[#E8E5E0] shadow-sm border-l-4 ${style.border}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${style.badge}`}>
                      {item.urgency}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">{timeAgo(item.created_at)}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">{item.title}</h3>
                  <p className="text-[11px] text-[#6B6B6B] mb-2">{item.summary}</p>
                  {item.impact_summary && (
                    <div className="bg-[#F5F4F0] rounded-md p-2.5 mb-2 border border-[#E8E5E0]">
                      <span className="text-[9px] font-semibold text-[#6B6B6B] uppercase">Impact: </span>
                      <span className="text-[11px] text-[#2D2D2D]">{item.impact_summary}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                    <span style={{ color: agent.color }} className="font-semibold">@{agent.name}</span>
                    {item.source_url && (
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Source
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

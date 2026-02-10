"use client";

import { useState, useEffect } from "react";
import type { CompetitorIntel } from "@/lib/types";
import { timeAgo, getAgent } from "@/lib/utils";

const COMPETITORS = ["all", "Coconut", "Taxd", "FreeAgent", "GoSimpleTax", "Ember", "TaxScouts"];
const SIGNIFICANCE_FILTERS = ["all", "critical", "high", "medium", "low"];

const SIGNIFICANCE_BADGE: Record<string, string> = {
  critical: "bg-red-50 text-red-700 border border-red-200",
  high: "bg-amber-50 text-amber-700 border border-amber-200",
  medium: "bg-blue-50 text-blue-700 border border-blue-200",
  low: "bg-[#F5F4F0] text-[#6B6B6B]",
};

export default function IntelPage() {
  const [items, setItems] = useState<CompetitorIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [competitorFilter, setCompetitorFilter] = useState("all");
  const [significanceFilter, setSignificanceFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (competitorFilter !== "all") params.set("competitor", competitorFilter);
    if (significanceFilter !== "all") params.set("significance", significanceFilter);
    fetch(`/api/ops/intel?${params}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setItems(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [competitorFilter, significanceFilter]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E8E5E0] bg-white shrink-0">
        <h1 className="text-base font-bold text-[#1A1A1A] mb-3">Competitor Intelligence</h1>
        <div className="flex gap-1.5 mb-2">
          {COMPETITORS.map((c) => (
            <button
              key={c}
              onClick={() => setCompetitorFilter(c)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                competitorFilter === c
                  ? "bg-[#E8952E] text-white"
                  : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {SIGNIFICANCE_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setSignificanceFilter(s)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors capitalize ${
                significanceFilter === s
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
              }`}
            >
              {s === "all" ? "All Significance" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Intel feed */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="text-center py-16 text-[#6B6B6B] text-sm">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-base font-semibold text-[#6B6B6B]">No competitor intel</div>
            <div className="text-xs text-[#9CA3AF] mt-1">Intel will appear here when Atlas finds updates</div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            {items.map((item) => {
              const agent = getAgent(item.agent_id);
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="bg-white rounded-lg p-4 border border-[#E8E5E0] hover:border-[#D4D1CC] cursor-pointer shadow-sm transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1A1A1A]">{item.competitor}</span>
                      <span className="text-[9px] bg-[#F5F4F0] px-1.5 py-0.5 rounded text-[#6B6B6B]">{item.intel_type}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${SIGNIFICANCE_BADGE[item.significance] ?? SIGNIFICANCE_BADGE.low}`}>
                      {item.significance}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-1">{item.title}</h3>
                  <p className="text-[11px] text-[#6B6B6B] mb-2">{item.summary}</p>
                  {isExpanded && item.findings && (
                    <div className="bg-[#F5F4F0] rounded-lg p-3 border border-[#E8E5E0] mb-2">
                      <div className="text-xs text-[#2D2D2D] leading-relaxed whitespace-pre-wrap">{item.findings}</div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-[#9CA3AF]">
                    <span style={{ color: agent.color }} className="font-semibold">@{agent.name}</span>
                    {item.source_url && (
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" onClick={(e) => e.stopPropagation()}>
                        Source
                      </a>
                    )}
                    <span>{timeAgo(item.created_at)}</span>
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

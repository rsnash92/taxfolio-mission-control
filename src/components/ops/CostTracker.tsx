"use client";

import { useState, useEffect } from "react";
import { AGENTS } from "@/lib/agents";

interface CostData {
  totals: {
    runs: number;
    input_tokens: number;
    output_tokens: number;
    searches: number;
    total_cost_gbp: number;
    avg_duration: number;
  };
  byAgent: Record<string, { runs: number; cost: number; tokens: number }>;
  byDay: Record<string, { cost: number; runs: number }>;
}

type Period = "7d" | "30d" | "all";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return String(n);
}

export default function CostTracker() {
  const [costs, setCosts] = useState<CostData | null>(null);
  const [period, setPeriod] = useState<Period>("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/ops/costs?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.totals) setCosts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const periodLabel = period === "7d" ? "7 days" : period === "30d" ? "30 days" : "all time";

  // Calculate projected monthly from daily average
  const daysInPeriod = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const dailyAvg = costs ? costs.totals.total_cost_gbp / Math.max(daysInPeriod, 1) : 0;
  const projectedMonthly = dailyAvg * 30;

  // Sort agents by cost desc
  const agentBreakdown = costs
    ? Object.entries(costs.byAgent)
        .sort(([, a], [, b]) => b.cost - a.cost)
        .map(([id, data]) => ({
          id,
          ...data,
          pct: costs.totals.total_cost_gbp > 0 ? (data.cost / costs.totals.total_cost_gbp) * 100 : 0,
        }))
    : [];

  // Daily chart data (last N days)
  const chartDays = costs
    ? Object.entries(costs.byDay)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
    : [];
  const maxDayCost = Math.max(...chartDays.map(([, d]) => d.cost), 0.01);

  return (
    <section className="bg-white rounded-lg p-5 border border-[#E8E5E0] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[#1A1A1A]">API Costs</h2>
        <div className="flex gap-1">
          {(["7d", "30d", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-full transition-colors ${
                period === p
                  ? "bg-[#E8952E] text-white"
                  : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
              }`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#6B6B6B] text-sm">Loading costs...</div>
      ) : !costs || costs.totals.runs === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">{"\u{1F4B0}"}</div>
          <div className="text-sm font-semibold text-[#6B6B6B]">No cost data yet</div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">
            Costs will appear here once agents start running tasks
          </div>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-[#FAFAF8] rounded-lg p-3 border border-[#E8E5E0] text-center">
              <div className="text-lg font-bold text-[#E8952E]">
                {"\u00A3"}{costs.totals.total_cost_gbp.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#6B6B6B]">Total ({periodLabel})</div>
            </div>
            <div className="bg-[#FAFAF8] rounded-lg p-3 border border-[#E8E5E0] text-center">
              <div className="text-lg font-bold text-[#1A1A1A]">{costs.totals.runs}</div>
              <div className="text-[10px] text-[#6B6B6B]">Runs</div>
            </div>
            <div className="bg-[#FAFAF8] rounded-lg p-3 border border-[#E8E5E0] text-center">
              <div className="text-lg font-bold text-[#1A1A1A]">
                {formatTokens(costs.totals.input_tokens + costs.totals.output_tokens)}
              </div>
              <div className="text-[10px] text-[#6B6B6B]">Tokens</div>
            </div>
          </div>

          {/* Daily chart */}
          {chartDays.length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] font-semibold text-[#6B6B6B] mb-2">Daily Spend</div>
              <div className="flex items-end gap-px h-24 bg-[#FAFAF8] rounded-lg border border-[#E8E5E0] px-2 py-2">
                {chartDays.map(([day, data]) => (
                  <div key={day} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    <div
                      className="w-full bg-[#E8952E] rounded-t opacity-80 hover:opacity-100 transition-opacity min-h-[2px]"
                      style={{ height: `${Math.max((data.cost / maxDayCost) * 100, 3)}%` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1A1A1A] text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                      {day.slice(5)}: {"\u00A3"}{data.cost.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-[#9CA3AF] mt-1 px-1">
                <span>{chartDays[0]?.[0]?.slice(5)}</span>
                <span>{chartDays[chartDays.length - 1]?.[0]?.slice(5)}</span>
              </div>
            </div>
          )}

          {/* Agent breakdown */}
          {agentBreakdown.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-semibold text-[#6B6B6B] mb-2">By Agent</div>
              <div className="space-y-1.5">
                {agentBreakdown.map((agent) => {
                  const info = AGENTS[agent.id as keyof typeof AGENTS];
                  return (
                    <div key={agent.id} className="flex items-center gap-2 text-xs">
                      <span className="text-sm w-5 text-center">{info?.icon || "\u{1F916}"}</span>
                      <span className="w-16 font-semibold text-[#1A1A1A] truncate">{info?.name || agent.id}</span>
                      <span className="w-14 text-[10px] text-[#6B6B6B]">{agent.runs} runs</span>
                      <span className="w-12 text-[10px] font-semibold text-[#1A1A1A]">
                        {"\u00A3"}{agent.cost.toFixed(2)}
                      </span>
                      <div className="flex-1 h-2 bg-[#F5F4F0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${agent.pct}%`,
                            backgroundColor: info?.color || "#E8952E",
                          }}
                        />
                      </div>
                      <span className="w-8 text-[9px] text-[#9CA3AF] text-right">{agent.pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projected */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E8E5E0]">
            <div className="text-[10px] text-[#6B6B6B]">
              Projected monthly: <span className="font-bold text-[#1A1A1A]">{"\u00A3"}{projectedMonthly.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-[#6B6B6B]">
              Avg duration: <span className="font-semibold">{costs.totals.avg_duration.toFixed(1)}s</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

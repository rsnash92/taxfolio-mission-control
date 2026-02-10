"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AGENTS, PRIORITY_COLORS } from "@/lib/agents";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

type Agent = (typeof AGENTS)[keyof typeof AGENTS];

interface Mission {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  agent_id: string;
  tags: string[];
  created_at: string;
  completed_at: string | null;
  ops_mission_steps: Step[];
}

interface Step {
  id: string;
  kind: string;
  title: string;
  status: string;
  step_order: number;
}

interface Approval {
  id: string;
  title: string;
  summary: string;
  deliverable_type: string;
  deliverable_table: string;
  status: string;
  priority: string;
  created_at: string;
  ops_review_reports: ReviewReport | null;
}

interface ReviewReport {
  verdict: string;
  issues: unknown[];
  suggestions: string;
  tax_accuracy_check: boolean;
  tax_accuracy_notes: string;
}

interface AgentEvent {
  id: string;
  agent_id: string;
  event_type: string;
  title: string;
  description: string;
  created_at: string;
  tags: string[];
}

const COLUMNS = [
  { key: "queued", label: "Queued", color: "#64748B" },
  { key: "running", label: "In Progress", color: "#3B82F6" },
  { key: "succeeded", label: "Done", color: "#10B981" },
  { key: "failed", label: "Failed", color: "#EF4444" },
];

const VERDICT_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pass: { bg: "#D1FAE530", color: "#6EE7B7", label: "PASS" },
  pass_with_notes: { bg: "#FEF3C730", color: "#FCD34D", label: "PASS WITH NOTES" },
  fail: { bg: "#FEE2E230", color: "#FCA5A5", label: "FAIL" },
};

const TYPE_ICONS: Record<string, string> = {
  content_draft: "📝",
  tweet_draft: "🐦",
  dev_deliverable: "💻",
  email: "📧",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function getAgent(id: string): Agent {
  return AGENTS[id as keyof typeof AGENTS] ?? { id, name: id, role: "", icon: "❓", color: "#64748B" };
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"approvals" | "missions">("approvals");
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [feedFilter, setFeedFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const fetchData = useCallback(async () => {
    try {
      const [missionsRes, approvalsRes, eventsRes] = await Promise.all([
        fetch("/api/ops/missions"),
        fetch("/api/ops/approvals"),
        fetch("/api/ops/missions?status=all"), // We'll add events endpoint later
      ]);
      const missionsData = await missionsRes.json();
      const approvalsData = await approvalsRes.json();

      if (Array.isArray(missionsData)) setMissions(missionsData);
      if (Array.isArray(approvalsData)) setApprovals(approvalsData);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleApproval = async (id: string, action: "approved" | "rejected", notes?: string) => {
    await fetch("/api/ops/approvals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, notes }),
    });
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const filteredMissions = missions.filter(
    (m) => selectedAgent === "all" || m.agent_id === selectedAgent
  );

  const agentList = Object.values(AGENTS);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top Bar ── */}
      <header className="bg-slate-800 px-5 py-2.5 flex items-center justify-between border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              T
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 tracking-tight">
                TaxFolio Mission Control
              </div>
              <div className="text-[10px] text-slate-500">
                Agent Orchestration • v2
              </div>
            </div>
          </div>

          <div className="flex gap-4 ml-6 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span>👥</span>
              <span className="font-bold text-slate-100">7</span> Agents
            </div>
            <div className="flex items-center gap-1.5">
              <span>📋</span>
              <span className="font-bold text-slate-100">{missions.length}</span> Missions
            </div>
            {approvals.length > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                <span>⏳</span>
                <span className="font-bold text-amber-400">{approvals.length}</span>
                <span className="text-amber-400">Awaiting Approval</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px] shadow-emerald-500" />
            <span className="text-emerald-500 font-semibold">System Online</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Agent Sidebar ── */}
        <aside className="w-52 bg-slate-800 border-r border-slate-700 py-2.5 overflow-y-auto shrink-0">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Agents
          </div>

          {/* All */}
          <button
            onClick={() => setSelectedAgent("all")}
            className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors ${
              selectedAgent === "all"
                ? "bg-slate-700 border-l-[3px] border-blue-500"
                : "border-l-[3px] border-transparent hover:bg-slate-800/50"
            }`}
          >
            <span className="text-sm">🌐</span>
            <div>
              <div className="text-[11px] font-semibold text-slate-100">All Agents</div>
              <div className="text-[9px] text-slate-500">View everything</div>
            </div>
          </button>

          {agentList.map((agent) => {
            const count = missions.filter((m) => m.agent_id === agent.id).length;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full px-3 py-2 flex items-center gap-2 text-left transition-colors ${
                  selectedAgent === agent.id
                    ? "bg-slate-700"
                    : "hover:bg-slate-800/50"
                }`}
                style={{
                  borderLeft: `3px solid ${selectedAgent === agent.id ? agent.color : "transparent"}`,
                }}
              >
                <span className="text-sm">{agent.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-semibold text-slate-100">{agent.name}</span>
                    {count > 0 && (
                      <span className="text-[9px] text-slate-400 bg-slate-900 px-1.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">{agent.role}</div>
                </div>
              </button>
            );
          })}
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Switcher */}
          <div className="flex bg-slate-800 border-b border-slate-700 shrink-0">
            {[
              { key: "approvals" as const, label: "Awaiting Approval", count: approvals.length, accent: "#F59E0B" },
              { key: "missions" as const, label: "All Missions", count: filteredMissions.length, accent: "#3B82F6" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "text-slate-100"
                    : "text-slate-500 border-transparent hover:text-slate-300"
                }`}
                style={{
                  borderBottomColor: activeTab === tab.key ? tab.accent : "transparent",
                }}
              >
                {tab.label}
                <span
                  className="px-1.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: activeTab === tab.key ? `${tab.accent}30` : "#334155",
                    color: activeTab === tab.key ? tab.accent : "#64748B",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── APPROVALS TAB ── */}
          {activeTab === "approvals" && (
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

                  {approvals.map((item) => {
                    const agent = getAgent(item.deliverable_type === "dev_deliverable" ? "dev" : "writer");
                    const verdict = item.ops_review_reports?.verdict ?? "pass";
                    const v = VERDICT_STYLES[verdict] ?? VERDICT_STYLES.pass;

                    return (
                      <div
                        key={item.id}
                        className="bg-slate-800 rounded-xl p-5 border border-slate-700"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {TYPE_ICONS[item.deliverable_type] ?? "📄"}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-slate-100">{item.title}</div>
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
                            {timeAgo(item.created_at)}
                          </span>
                        </div>

                        {item.summary && (
                          <div className="bg-slate-900 rounded-md p-3 mb-4 border-l-[3px] border-slate-600">
                            <span className="text-[10px] text-slate-500 font-semibold">
                              SHIELD SUMMARY:
                            </span>
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleApproval(item.id, "rejected")}
                            className="px-3.5 py-1.5 text-[11px] font-semibold rounded-md bg-red-900/20 border border-red-900/40 text-red-300 hover:bg-red-900/30 transition-colors"
                          >
                            ✗ Reject
                          </button>
                          <button
                            onClick={() => handleApproval(item.id, "approved")}
                            className="px-4 py-1.5 text-[11px] font-bold rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                          >
                            ✓ Approve
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── MISSIONS TAB (Kanban) ── */}
          {activeTab === "missions" && (
            <div className="flex-1 p-4 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-3 h-full">
                {COLUMNS.map((col) => {
                  const colMissions = filteredMissions.filter((m) => m.status === col.key);
                  return (
                    <div key={col.key} className="flex-1 min-w-[240px] flex flex-col">
                      <div className="flex items-center gap-2 mb-2.5 px-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: col.color }}
                        />
                        <span className="text-xs font-semibold text-slate-300">{col.label}</span>
                        <span className="text-[11px] text-slate-500">{colMissions.length}</span>
                      </div>

                      <div className="flex-1 bg-slate-800 rounded-lg p-2 overflow-y-auto border border-slate-700">
                        {colMissions.length === 0 ? (
                          <div className="text-center py-8 text-[11px] text-slate-600">
                            No missions
                          </div>
                        ) : (
                          colMissions.map((m) => {
                            const agent = getAgent(m.agent_id);
                            const steps = m.ops_mission_steps ?? [];
                            const doneSteps = steps.filter((s) => s.status === "succeeded").length;

                            return (
                              <div
                                key={m.id}
                                className="bg-slate-900 rounded-lg p-3 mb-2 border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
                              >
                                <div className="flex items-start gap-1.5 mb-1.5">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                    style={{ background: PRIORITY_COLORS[m.priority] }}
                                  />
                                  <span className="text-xs font-semibold text-slate-100 leading-tight">
                                    {m.title}
                                  </span>
                                </div>

                                {m.description && (
                                  <p className="text-[11px] text-slate-500 mb-2 line-clamp-2">
                                    {m.description}
                                  </p>
                                )}

                                {steps.length > 0 && (
                                  <div className="flex items-center gap-1.5 mb-2">
                                    <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{
                                          width: `${(doneSteps / steps.length) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[9px] text-slate-500">
                                      {doneSteps}/{steps.length}
                                    </span>
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-1 mb-2">
                                  {(m.tags ?? []).map((t) => (
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
                                    style={{
                                      color: agent.color,
                                      background: `${agent.color}15`,
                                    }}
                                  >
                                    @{agent.name}
                                  </span>
                                  <span className="text-[10px] text-slate-600">
                                    {timeAgo(m.created_at)}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ── Live Feed Sidebar ── */}
        <aside className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col shrink-0">
          <div className="px-3.5 py-2.5 border-b border-slate-700 flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">Live Feed</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px] shadow-emerald-500" />
          </div>

          <div className="flex gap-1 px-3 py-1.5 border-b border-slate-700">
            {["All", "Decisions", "System"].map((f) => (
              <button
                key={f}
                onClick={() => setFeedFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  feedFilter === f
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-1.5">
            {events.length === 0 ? (
              <div className="text-center py-12 text-[11px] text-slate-600">
                <div className="text-2xl mb-2">📡</div>
                Events will appear here once agents start running
              </div>
            ) : (
              events.map((e) => {
                const agent = getAgent(e.agent_id);
                return (
                  <div
                    key={e.id}
                    className="flex gap-2 py-2 border-b border-slate-800 text-[11px]"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                      style={{ background: agent.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex gap-1.5 items-center mb-0.5">
                        <span className="font-bold" style={{ color: agent.color }}>
                          @{agent.name}
                        </span>
                        <span className="text-[9px] text-slate-500">{e.event_type}</span>
                      </div>
                      <div className="text-slate-300 leading-snug">{e.title}</div>
                    </div>
                    <span className="text-[9px] text-slate-600 shrink-0">
                      {timeAgo(e.created_at)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

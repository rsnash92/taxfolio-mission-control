"use client";

interface TabSwitcherProps {
  activeTab: "approvals" | "missions";
  onTabChange: (tab: "approvals" | "missions") => void;
  approvalCount: number;
  missionCount: number;
}

export default function TabSwitcher({ activeTab, onTabChange, approvalCount, missionCount }: TabSwitcherProps) {
  const tabs = [
    { key: "approvals" as const, label: "Awaiting Approval", count: approvalCount, accent: "#F59E0B" },
    { key: "missions" as const, label: "All Missions", count: missionCount, accent: "#3B82F6" },
  ];

  return (
    <div className="flex bg-slate-800 border-b border-slate-700 shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
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
  );
}

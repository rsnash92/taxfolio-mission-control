"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import AgentSidebar from "@/components/AgentSidebar";
import LiveFeed from "@/components/LiveFeed";
import NewMissionModal from "@/components/NewMissionModal";

// Context to share dashboard data with child pages
import { createContext, useContext } from "react";
import type { Mission, Approval, AgentEvent } from "@/lib/types";

interface DashboardContextValue {
  missions: Mission[];
  approvals: Approval[];
  events: AgentEvent[];
  loading: boolean;
  selectedAgent: string;
  setSelectedAgent: (id: string) => void;
  fetchData: () => Promise<void>;
  handleApproval: (id: string, action: "approved" | "rejected", notes?: string) => Promise<void>;
  showNewMission: boolean;
  setShowNewMission: (show: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue>(null!);
export function useDashboard() {
  return useContext(DashboardContext);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { missions, approvals, events, loading, fetchData, handleApproval } = useDashboardData();
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [showNewMission, setShowNewMission] = useState(false);

  return (
    <DashboardContext.Provider
      value={{
        missions,
        approvals,
        events,
        loading,
        selectedAgent,
        setSelectedAgent,
        fetchData,
        handleApproval,
        showNewMission,
        setShowNewMission,
      }}
    >
      <div className="flex flex-col h-screen overflow-hidden">
        <TopBar
          missionCount={missions.length}
          approvalCount={approvals.length}
          onNewMission={() => setShowNewMission(true)}
        />
        <NavBar />
        <div className="flex flex-1 overflow-hidden">
          <AgentSidebar
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            missions={missions}
          />
          <main className="flex-1 flex flex-col overflow-hidden">
            {children}
          </main>
          <LiveFeed events={events} />
        </div>
      </div>

      <NewMissionModal
        isOpen={showNewMission}
        onClose={() => setShowNewMission(false)}
        onCreated={() => fetchData()}
      />
    </DashboardContext.Provider>
  );
}

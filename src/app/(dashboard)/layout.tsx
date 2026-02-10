"use client";

import { useState } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import AgentSidebar from "@/components/AgentSidebar";
import LiveFeed from "@/components/LiveFeed";
import NewMissionModal from "@/components/NewMissionModal";
import BroadcastModal from "@/components/BroadcastModal";
import SquadChatModal from "@/components/SquadChatModal";
import AgentProfileSlider from "@/components/AgentProfileSlider";

import { createContext, useContext, useMemo } from "react";
import type { Mission, Approval, AgentEvent, Proposal } from "@/lib/types";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface DashboardContextValue {
  missions: Mission[];
  approvals: Approval[];
  events: AgentEvent[];
  proposals: Proposal[];
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
  const { missions, approvals, events, proposals, loading, fetchData, handleApproval } = useDashboardData();
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [showNewMission, setShowNewMission] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [profileAgent, setProfileAgent] = useState<string | null>(null);
  const [systemPaused, setSystemPaused] = useState(false);

  const shortcutHandlers = useMemo(() => ({
    onNewMission: () => setShowNewMission(true),
    onBroadcast: () => setShowBroadcast(true),
    onChat: () => setShowChat(true),
    onEscape: () => {
      setShowNewMission(false);
      setShowBroadcast(false);
      setShowChat(false);
      setProfileAgent(null);
    },
  }), []);
  useKeyboardShortcuts(shortcutHandlers);

  const handleTogglePause = async () => {
    const newState = !systemPaused;
    setSystemPaused(newState);
    try {
      await fetch("/api/ops/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "system_paused", value: { enabled: newState } }),
      });
    } catch {
      setSystemPaused(!newState);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        missions,
        approvals,
        events,
        proposals,
        loading,
        selectedAgent,
        setSelectedAgent,
        fetchData,
        handleApproval,
        showNewMission,
        setShowNewMission,
      }}
    >
      <div className="flex flex-col h-screen overflow-hidden bg-[#FAFAF8]">
        <TopBar
          missionCount={missions.length}
          approvalCount={approvals.length}
          onNewMission={() => setShowNewMission(true)}
          onBroadcast={() => setShowBroadcast(true)}
          onChat={() => setShowChat(true)}
          systemPaused={systemPaused}
          onTogglePause={handleTogglePause}
        />
        <NavBar />
        <div className="flex flex-1 overflow-hidden">
          <AgentSidebar
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            onAgentProfile={setProfileAgent}
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

      <BroadcastModal
        isOpen={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        onSent={() => fetchData()}
      />

      <SquadChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

      <AgentProfileSlider
        isOpen={!!profileAgent}
        onClose={() => setProfileAgent(null)}
        agentId={profileAgent}
        missions={missions}
        events={events}
      />
    </DashboardContext.Provider>
  );
}

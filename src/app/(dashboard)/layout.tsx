"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboardData } from "@/hooks/useDashboardData";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import AgentSidebar from "@/components/AgentSidebar";
import LiveFeed from "@/components/LiveFeed";
import NewMissionModal from "@/components/NewMissionModal";
import BroadcastModal from "@/components/BroadcastModal";
import SquadChatModal from "@/components/SquadChatModal";
import AgentProfileSlider from "@/components/AgentProfileSlider";
import JarvisChat from "@/components/ops/JarvisChat";

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
  const [showJarvis, setShowJarvis] = useState(false);
  const [profileAgent, setProfileAgent] = useState<string | null>(null);
  const [systemPaused, setSystemPaused] = useState(false);

  // Fetch real system pause state from DB on mount
  useEffect(() => {
    fetch("/api/ops/agent-status")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const system = data.find((a: { agent_id: string }) => a.agent_id === "system");
          if (system) setSystemPaused(!system.is_active);
        }
      })
      .catch(() => {});
  }, []);

  const shortcutHandlers = useMemo(() => ({
    onNewMission: () => setShowNewMission(true),
    onBroadcast: () => setShowBroadcast(true),
    onChat: () => setShowChat(true),
    onJarvis: () => setShowJarvis((prev) => !prev),
    onEscape: () => {
      setShowNewMission(false);
      setShowBroadcast(false);
      setShowChat(false);
      setShowJarvis(false);
      setProfileAgent(null);
    },
  }), []);
  useKeyboardShortcuts(shortcutHandlers);

  const handleTogglePause = useCallback(async () => {
    const newPaused = !systemPaused;
    setSystemPaused(newPaused);
    try {
      await fetch("/api/ops/agent-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: "system", is_active: !newPaused }),
      });
    } catch {
      setSystemPaused(!newPaused);
    }
  }, [systemPaused]);

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
          onJarvis={() => setShowJarvis(true)}
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

      <JarvisChat
        isOpen={showJarvis}
        onClose={() => setShowJarvis(false)}
        onMissionCreated={() => fetchData()}
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

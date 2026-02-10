"use client";

import { useState } from "react";
import { useDashboard } from "./layout";
import TabSwitcher from "@/components/TabSwitcher";
import ApprovalQueue from "@/components/ApprovalQueue";
import KanbanBoard from "@/components/KanbanBoard";
import MissionDetailSlider from "@/components/MissionDetailSlider";
import type { Mission } from "@/lib/types";

export default function DashboardPage() {
  const { missions, approvals, loading, selectedAgent, handleApproval } = useDashboard();
  const [activeTab, setActiveTab] = useState<"approvals" | "missions">("approvals");
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const filteredMissions = missions.filter(
    (m) => selectedAgent === "all" || m.agent_id === selectedAgent
  );

  return (
    <>
      <TabSwitcher
        activeTab={activeTab}
        onTabChange={setActiveTab}
        approvalCount={approvals.length}
        missionCount={filteredMissions.length}
      />

      {activeTab === "approvals" && (
        <ApprovalQueue
          approvals={approvals}
          loading={loading}
          onApproval={handleApproval}
        />
      )}

      {activeTab === "missions" && (
        <KanbanBoard
          missions={missions}
          selectedAgent={selectedAgent}
          onMissionClick={(m) => setSelectedMission(m)}
        />
      )}

      <MissionDetailSlider
        isOpen={!!selectedMission}
        onClose={() => setSelectedMission(null)}
        mission={selectedMission}
      />
    </>
  );
}

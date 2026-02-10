"use client";

import { useState, useEffect, useCallback } from "react";
import type { Mission, Approval, AgentEvent } from "@/lib/types";

export function useDashboardData() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [missionsRes, approvalsRes, eventsRes] = await Promise.all([
        fetch("/api/ops/missions"),
        fetch("/api/ops/approvals"),
        fetch("/api/ops/events?limit=100"),
      ]);
      const missionsData = await missionsRes.json();
      const approvalsData = await approvalsRes.json();
      const eventsData = await eventsRes.json();

      if (Array.isArray(missionsData)) setMissions(missionsData);
      if (Array.isArray(approvalsData)) setApprovals(approvalsData);
      if (Array.isArray(eventsData)) setEvents(eventsData);
    } catch (e) {
      console.error("Failed to fetch data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
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

  return { missions, approvals, events, loading, fetchData, handleApproval };
}

import { AGENTS } from "@/lib/agents";
import type { Agent } from "@/lib/types";

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function getAgent(id: string): Agent {
  return AGENTS[id as keyof typeof AGENTS] ?? { id, name: id, role: "", icon: "\u2753", color: "#64748B" };
}

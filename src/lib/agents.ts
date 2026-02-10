export const AGENTS = {
  jarvis:   { id: "jarvis",   name: "Jarvis",   role: "Orchestrator",           icon: "👑", color: "#8B5CF6" },
  analyst:  { id: "analyst",  name: "Atlas",     role: "Strategy & Market Intel", icon: "📊", color: "#3B82F6" },
  scout:    { id: "scout",    name: "Sentinel",  role: "HMRC Monitor",           icon: "🔍", color: "#10B981" },
  writer:   { id: "writer",   name: "Quill",     role: "Content & SEO",          icon: "✍️", color: "#F59E0B" },
  growth:   { id: "growth",   name: "Echo",      role: "Social & Lead Gen",      icon: "📈", color: "#EF4444" },
  reviewer: { id: "reviewer", name: "Shield",    role: "Quality Assurance",      icon: "🛡️", color: "#06B6D4" },
  dev:      { id: "dev",      name: "Forge",     role: "Developer",              icon: "💻", color: "#A855F7" },
} as const;

export type AgentId = keyof typeof AGENTS;

export const PRIORITY_COLORS: Record<string, string> = {
  critical: "#EF4444",
  high: "#F59E0B",
  medium: "#3B82F6",
  low: "#64748B",
};

export const STATUS_COLORS: Record<string, string> = {
  queued: "#64748B",
  running: "#3B82F6",
  succeeded: "#10B981",
  failed: "#EF4444",
  cancelled: "#64748B",
  pending: "#F59E0B",
  accepted: "#10B981",
  rejected: "#EF4444",
};

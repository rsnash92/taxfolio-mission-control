import { AGENTS } from "@/lib/agents";

export type Agent = (typeof AGENTS)[keyof typeof AGENTS];

export interface Mission {
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

export interface Step {
  id: string;
  kind: string;
  title: string;
  status: string;
  step_order: number;
}

export interface Approval {
  id: string;
  title: string;
  summary: string;
  deliverable_type: string;
  deliverable_table: string;
  deliverable_id: string;
  status: string;
  priority: string;
  created_at: string;
  ops_review_reports: ReviewReport | null;
}

export interface ReviewReport {
  verdict: string;
  issues: unknown[];
  suggestions: string;
  tax_accuracy_check: boolean;
  tax_accuracy_notes: string;
}

export interface AgentEvent {
  id: string;
  agent_id: string;
  event_type: string;
  title: string;
  description: string;
  created_at: string;
  tags: string[];
}

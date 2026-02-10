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

export interface Proposal {
  id: string;
  agent_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  source: string;
  tags: string[];
  created_at: string;
}

export interface ContentDraft {
  id: string;
  agent_id: string;
  title: string;
  body: string;
  content_type: string;
  status: string;
  word_count: number;
  seo_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface CompetitorIntel {
  id: string;
  agent_id: string;
  competitor: string;
  intel_type: string;
  title: string;
  summary: string;
  findings: string;
  significance: string;
  source_url: string | null;
  created_at: string;
}

export interface HmrcUpdate {
  id: string;
  agent_id: string;
  title: string;
  summary: string;
  impact_summary: string;
  urgency: string;
  source_url: string | null;
  created_at: string;
}

export interface SquadMessage {
  id: string;
  agent_id: string;
  content: string;
  mentions: string[];
  message_type: string;
  reference_id: string | null;
  created_at: string;
}

-- ============================================================
-- TaxFolio Mission Control — Supabase schema
-- Run this against your Supabase project via the SQL editor
-- ============================================================

-- 1. Proposals (inbox items that become missions)
CREATE TABLE IF NOT EXISTS ops_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  source TEXT DEFAULT 'agent',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON ops_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON ops_proposals(created_at DESC);

-- 2. Missions
CREATE TABLE IF NOT EXISTS ops_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'queued',
  priority TEXT DEFAULT 'medium',
  proposal_id UUID REFERENCES ops_proposals(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_missions_status ON ops_missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_agent ON ops_missions(agent_id);

-- 3. Mission steps
CREATE TABLE IF NOT EXISTS ops_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL REFERENCES ops_missions(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  input JSONB DEFAULT '{}',
  output JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_steps_mission ON ops_steps(mission_id);

-- 4. Approvals
CREATE TABLE IF NOT EXISTS ops_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID REFERENCES ops_steps(id),
  mission_id UUID REFERENCES ops_missions(id),
  agent_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  summary TEXT,
  diff_url TEXT,
  payload JSONB DEFAULT '{}',
  verdict TEXT DEFAULT 'pending',
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_approvals_verdict ON ops_approvals(verdict);
CREATE INDEX IF NOT EXISTS idx_approvals_created ON ops_approvals(created_at DESC);

-- 5. Agent events (live feed)
CREATE TABLE IF NOT EXISTS ops_agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_created ON ops_agent_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_agent ON ops_agent_events(agent_id);

-- 6. Policy / settings store
CREATE TABLE IF NOT EXISTS ops_policy (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Squad chat messages
CREATE TABLE IF NOT EXISTS ops_squad_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  mentions TEXT[] DEFAULT '{}',
  message_type TEXT DEFAULT 'update',
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_squad_messages_created ON ops_squad_messages(created_at DESC);

-- 8. Content drafts
CREATE TABLE IF NOT EXISTS ops_content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  content_type TEXT DEFAULT 'blog',
  status TEXT DEFAULT 'draft',
  word_count INT DEFAULT 0,
  seo_score NUMERIC(3,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_content_status ON ops_content_drafts(status);
CREATE INDEX IF NOT EXISTS idx_content_created ON ops_content_drafts(created_at DESC);

-- 9. Competitor intel
CREATE TABLE IF NOT EXISTS ops_competitor_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  competitor TEXT NOT NULL,
  intel_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  findings TEXT,
  significance TEXT DEFAULT 'medium',
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_intel_competitor ON ops_competitor_intel(competitor);
CREATE INDEX IF NOT EXISTS idx_intel_created ON ops_competitor_intel(created_at DESC);

-- 10. HMRC updates
CREATE TABLE IF NOT EXISTS ops_hmrc_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  impact_summary TEXT,
  urgency TEXT DEFAULT 'medium',
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hmrc_urgency ON ops_hmrc_updates(urgency);
CREATE INDEX IF NOT EXISTS idx_hmrc_created ON ops_hmrc_updates(created_at DESC);

-- 11. Project context (agent briefing doc)
CREATE TABLE IF NOT EXISTS ops_project_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  updated_by TEXT DEFAULT 'rob',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_context_section ON ops_project_context(section);

-- 12. Agent status (stop/start controls)
CREATE TABLE IF NOT EXISTS ops_agent_status (
  agent_id TEXT PRIMARY KEY,
  is_active BOOLEAN DEFAULT true,
  paused_at TIMESTAMPTZ,
  paused_by TEXT DEFAULT 'rob',
  reason TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. API cost tracking
CREATE TABLE IF NOT EXISTS ops_cost_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID,
  step_id UUID,
  agent_id TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'claude-sonnet-4-5-20250929',
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  search_queries INTEGER NOT NULL DEFAULT 0,
  estimated_cost_gbp NUMERIC(10,4) NOT NULL DEFAULT 0,
  duration_seconds NUMERIC(10,1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cost_log_agent ON ops_cost_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_cost_log_created ON ops_cost_log(created_at);

-- Cost summary view (daily aggregates per agent)
CREATE OR REPLACE VIEW ops_cost_summary AS
SELECT
  agent_id,
  DATE(created_at) as day,
  COUNT(*) as runs,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(search_queries) as total_searches,
  SUM(estimated_cost_gbp) as total_cost_gbp,
  AVG(duration_seconds) as avg_duration_seconds
FROM ops_cost_log
GROUP BY agent_id, DATE(created_at);

-- Seed default policies
INSERT INTO ops_policy (key, value) VALUES
  ('x_daily_quota', '{"limit": 10}'),
  ('content_daily_quota', '{"limit": 5}'),
  ('auto_approve', '{"enabled": false, "auto_approve_kinds": []}'),
  ('system_paused', '{"enabled": false}')
ON CONFLICT (key) DO NOTHING;

-- Seed agent status
INSERT INTO ops_agent_status (agent_id, is_active) VALUES
  ('system', true),
  ('jarvis', true),
  ('analyst', true),
  ('scout', true),
  ('writer', true),
  ('growth', true),
  ('reviewer', true),
  ('dev', true)
ON CONFLICT (agent_id) DO NOTHING;

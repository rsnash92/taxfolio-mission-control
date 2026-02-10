import { SupabaseClient } from "@supabase/supabase-js";

interface ProposalInput {
  agent_id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  source?: "api" | "trigger" | "reaction" | "cron";
  tags?: string[];
  steps?: StepInput[];
}

interface StepInput {
  kind: string;
  title: string;
  description?: string;
  input?: Record<string, unknown>;
}

interface ProposalResult {
  status: "rejected" | "pending" | "auto_approved";
  proposal: Record<string, unknown>;
  mission?: Record<string, unknown>;
  reason?: string;
}

// ─── Cap Gates ───────────────────────────────────────────
async function checkCapGates(
  sb: SupabaseClient,
  steps: StepInput[]
): Promise<{ allowed: boolean; reason?: string }> {
  const kinds = steps.map((s) => s.kind);

  // Check tweet quota
  if (kinds.includes("draft_tweet") || kinds.includes("post_tweet")) {
    const policy = await sb
      .from("ops_policy")
      .select("value")
      .eq("key", "x_daily_quota")
      .single();
    const limit = policy.data?.value?.limit ?? 5;

    const today = new Date().toISOString().split("T")[0];
    const { count } = await sb
      .from("ops_tweet_drafts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today);

    if ((count ?? 0) >= limit) {
      return { allowed: false, reason: `Tweet daily quota reached (${limit})` };
    }
  }

  // Check content quota
  if (kinds.includes("draft_content")) {
    const policy = await sb
      .from("ops_policy")
      .select("value")
      .eq("key", "content_daily_quota")
      .single();
    const limit = policy.data?.value?.limit ?? 3;

    const today = new Date().toISOString().split("T")[0];
    const { count } = await sb
      .from("ops_content_drafts")
      .select("id", { count: "exact", head: true })
      .gte("created_at", today);

    if ((count ?? 0) >= limit) {
      return {
        allowed: false,
        reason: `Content daily quota reached (${limit})`,
      };
    }
  }

  return { allowed: true };
}

// ─── Auto-Approve Check ─────────────────────────────────
async function shouldAutoApprove(
  sb: SupabaseClient,
  steps: StepInput[]
): Promise<boolean> {
  const policy = await sb
    .from("ops_policy")
    .select("value")
    .eq("key", "auto_approve")
    .single();

  if (!policy.data?.value?.enabled) return false;

  const allowedKinds: string[] =
    policy.data.value.auto_approve_kinds ?? [];
  const stepKinds = steps.map((s) => s.kind);

  return stepKinds.every((k) => allowedKinds.includes(k));
}

// ─── Main Entry Point ───────────────────────────────────
export async function createProposalAndMaybeAutoApprove(
  sb: SupabaseClient,
  input: ProposalInput
): Promise<ProposalResult> {
  const steps = input.steps ?? [];

  // 1. Cap gates — reject at the door
  if (steps.length > 0) {
    const gate = await checkCapGates(sb, steps);
    if (!gate.allowed) {
      const { data: proposal } = await sb
        .from("ops_mission_proposals")
        .insert({
          agent_id: input.agent_id,
          title: input.title,
          description: input.description,
          priority: input.priority ?? "medium",
          source: input.source ?? "api",
          tags: input.tags ?? [],
          status: "rejected",
          rejection_reason: gate.reason,
          decided_at: new Date().toISOString(),
        })
        .select()
        .single();

      // Log warning event
      await sb.from("ops_agent_events").insert({
        agent_id: input.agent_id,
        event_type: "quota_rejected",
        title: `Proposal rejected: ${gate.reason}`,
        description: input.title,
        tags: ["quota", "rejected"],
      });

      return { status: "rejected", proposal: proposal!, reason: gate.reason };
    }
  }

  // 2. Create proposal
  const { data: proposal } = await sb
    .from("ops_mission_proposals")
    .insert({
      agent_id: input.agent_id,
      title: input.title,
      description: input.description,
      priority: input.priority ?? "medium",
      source: input.source ?? "api",
      tags: input.tags ?? [],
      status: "pending",
    })
    .select()
    .single();

  if (!proposal) throw new Error("Failed to create proposal");

  // 3. Auto-approve check
  if (steps.length > 0 && (await shouldAutoApprove(sb, steps))) {
    // Update proposal to accepted
    await sb
      .from("ops_mission_proposals")
      .update({
        status: "accepted",
        decided_at: new Date().toISOString(),
      })
      .eq("id", proposal.id);

    // Create mission
    const { data: mission } = await sb
      .from("ops_missions")
      .insert({
        proposal_id: proposal.id,
        agent_id: input.agent_id,
        title: input.title,
        description: input.description,
        status: "queued",
        priority: input.priority ?? "medium",
        tags: input.tags ?? [],
      })
      .select()
      .single();

    if (!mission) throw new Error("Failed to create mission");

    // Create steps
    for (let i = 0; i < steps.length; i++) {
      await sb.from("ops_mission_steps").insert({
        mission_id: mission.id,
        agent_id: input.agent_id,
        step_order: i + 1,
        kind: steps[i].kind,
        title: steps[i].title,
        description: steps[i].description,
        input: steps[i].input ?? {},
        status: "queued",
      });
    }

    // Log event
    await sb.from("ops_agent_events").insert({
      agent_id: input.agent_id,
      event_type: "mission_auto_approved",
      title: `Mission auto-approved: ${input.title}`,
      description: `${steps.length} steps created`,
      tags: ["auto_approved", "mission_created"],
    });

    return {
      status: "auto_approved",
      proposal: { ...proposal, status: "accepted" },
      mission,
    };
  }

  // 4. Leave as pending for human review
  await sb.from("ops_agent_events").insert({
    agent_id: input.agent_id,
    event_type: "proposal_pending",
    title: `Proposal pending review: ${input.title}`,
    tags: ["pending"],
  });

  return { status: "pending", proposal };
}

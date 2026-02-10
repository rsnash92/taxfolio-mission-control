import { SupabaseClient } from "@supabase/supabase-js";
import { createProposalAndMaybeAutoApprove } from "./proposal-service";

export async function evaluateTriggers(sb: SupabaseClient): Promise<number> {
  const { data: rules } = await sb
    .from("ops_trigger_rules")
    .select("*")
    .eq("enabled", true);

  if (!rules || rules.length === 0) return 0;

  let fired = 0;

  for (const rule of rules) {
    // Check cooldown
    if (rule.last_fired_at) {
      const cooldownMs = (rule.cooldown_minutes ?? 120) * 60 * 1000;
      const elapsed = Date.now() - new Date(rule.last_fired_at).getTime();
      if (elapsed < cooldownMs) continue;
    }

    // Evaluate condition
    const shouldFire = await evaluateCondition(sb, rule);
    if (!shouldFire) continue;

    // Fire: create proposal
    await createProposalAndMaybeAutoApprove(sb, {
      agent_id: rule.action_agent_id,
      title: `[Trigger] ${rule.name}`,
      description: `Auto-triggered by: ${rule.condition_type}`,
      priority: "medium",
      source: "trigger",
      tags: ["trigger", rule.condition_type],
      steps: [
        {
          kind: rule.action_type,
          title: rule.name,
          input: rule.condition_config,
        },
      ],
    });

    // Update last_fired_at
    await sb
      .from("ops_trigger_rules")
      .update({ last_fired_at: new Date().toISOString() })
      .eq("id", rule.id);

    fired++;
  }

  return fired;
}

async function evaluateCondition(
  sb: SupabaseClient,
  rule: Record<string, unknown>
): Promise<boolean> {
  const condType = rule.condition_type as string;
  const config = rule.condition_config as Record<string, unknown>;

  switch (condType) {
    case "tweet_engagement_threshold": {
      const threshold = (config.engagement_rate_pct as number) ?? 5;
      const { data: tweets } = await sb
        .from("ops_tweet_drafts")
        .select("engagement_data")
        .eq("status", "posted")
        .order("posted_at", { ascending: false })
        .limit(5);

      return (tweets ?? []).some((t) => {
        const eng = t.engagement_data as Record<string, number> | null;
        return eng && (eng.engagement_rate ?? 0) > threshold;
      });
    }

    case "mission_failed": {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const { count } = await sb
        .from("ops_missions")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("completed_at", oneHourAgo);

      return (count ?? 0) > 0;
    }

    case "hmrc_update_critical": {
      const sixHoursAgo = new Date(Date.now() - 21600000).toISOString();
      const { count } = await sb
        .from("ops_hmrc_updates")
        .select("id", { count: "exact", head: true })
        .eq("urgency", "critical")
        .gte("created_at", sixHoursAgo);

      return (count ?? 0) > 0;
    }

    case "competitor_intel_high": {
      const fourHoursAgo = new Date(Date.now() - 14400000).toISOString();
      const { count } = await sb
        .from("ops_competitor_intel")
        .select("id", { count: "exact", head: true })
        .eq("significance", "high")
        .gte("created_at", fourHoursAgo);

      return (count ?? 0) > 0;
    }

    case "scheduled_weekly": {
      const now = new Date();
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const targetDay = config.day as string;
      const targetHour = config.hour as number;

      return dayNames[now.getUTCDay()] === targetDay && now.getUTCHours() === targetHour;
    }

    default:
      return false;
  }
}

import { SupabaseClient } from "@supabase/supabase-js";
import { createProposalAndMaybeAutoApprove } from "./proposal-service";

export async function processReactionQueue(sb: SupabaseClient): Promise<number> {
  const { data: reactions } = await sb
    .from("ops_agent_reactions")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(10);

  if (!reactions || reactions.length === 0) return 0;

  let processed = 0;

  for (const reaction of reactions) {
    // Mark as processing
    await sb
      .from("ops_agent_reactions")
      .update({ status: "processing" })
      .eq("id", reaction.id);

    try {
      // Map reaction type to proposal
      const proposalInput = mapReactionToProposal(reaction);

      if (proposalInput) {
        await createProposalAndMaybeAutoApprove(sb, proposalInput);
      }

      // Mark as done
      await sb
        .from("ops_agent_reactions")
        .update({
          status: "done",
          processed_at: new Date().toISOString(),
        })
        .eq("id", reaction.id);

      processed++;
    } catch (error) {
      // Mark as failed
      await sb
        .from("ops_agent_reactions")
        .update({ status: "failed" })
        .eq("id", reaction.id);
    }
  }

  return processed;
}

function mapReactionToProposal(reaction: Record<string, unknown>) {
  const type = reaction.reaction_type as string;
  const target = reaction.target_agent_id as string;
  const payload = reaction.payload as Record<string, unknown>;

  switch (type) {
    case "review_content":
      return {
        agent_id: target,
        title: `Review content: ${payload.title ?? "Untitled"}`,
        priority: "high" as const,
        source: "reaction" as const,
        tags: ["review", "content"],
        steps: [
          {
            kind: "review",
            title: "Review content for accuracy and quality",
            input: payload,
          },
        ],
      };

    case "review_tweet":
      return {
        agent_id: target,
        title: `Review tweet draft`,
        priority: "medium" as const,
        source: "reaction" as const,
        tags: ["review", "tweet"],
        steps: [
          {
            kind: "review",
            title: "Review tweet for accuracy and brand voice",
            input: payload,
          },
        ],
      };

    case "review_code":
      return {
        agent_id: target,
        title: `Review code: ${payload.title ?? "Untitled"}`,
        priority: "high" as const,
        source: "reaction" as const,
        tags: ["review", "code"],
        steps: [
          {
            kind: "review",
            title: "Review code changes for quality and security",
            input: payload,
          },
        ],
      };

    case "queue_for_human_approval":
      return {
        agent_id: target,
        title: `Queue for Rob: ${payload.title ?? "Untitled"}`,
        priority: "high" as const,
        source: "reaction" as const,
        tags: ["approval", "human"],
        steps: [
          {
            kind: "queue_approval",
            title: "Add to Rob's approval queue",
            input: payload,
          },
        ],
      };

    case "diagnose":
      return {
        agent_id: target,
        title: `Diagnose failure: ${payload.title ?? "Unknown"}`,
        priority: "high" as const,
        source: "reaction" as const,
        tags: ["diagnose", "failure"],
        steps: [
          {
            kind: "analyze",
            title: "Diagnose mission failure",
            input: payload,
          },
        ],
      };

    case "urgent_review":
      return {
        agent_id: target,
        title: `URGENT: HMRC change detected`,
        priority: "critical" as const,
        source: "reaction" as const,
        tags: ["hmrc", "critical", "urgent"],
        steps: [
          {
            kind: "analyze",
            title: "Review critical HMRC update",
            input: payload,
          },
        ],
      };

    case "analyze_engagement":
      return {
        agent_id: target,
        title: `Analyze tweet engagement`,
        priority: "low" as const,
        source: "reaction" as const,
        tags: ["analysis", "engagement"],
        steps: [
          {
            kind: "analyze",
            title: "Analyze tweet engagement metrics",
            input: payload,
          },
        ],
      };

    default:
      return null;
  }
}

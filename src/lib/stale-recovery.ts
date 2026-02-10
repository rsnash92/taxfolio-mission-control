import { SupabaseClient } from "@supabase/supabase-js";

export async function recoverStaleSteps(sb: SupabaseClient): Promise<number> {
  // Find steps that have been running for > 30 minutes
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: staleSteps } = await sb
    .from("ops_mission_steps")
    .select("id, mission_id")
    .eq("status", "running")
    .lt("reserved_at", thirtyMinAgo);

  if (!staleSteps || staleSteps.length === 0) return 0;

  let recovered = 0;

  for (const step of staleSteps) {
    // Mark step as failed
    await sb
      .from("ops_mission_steps")
      .update({
        status: "failed",
        last_error: "Step timed out after 30 minutes",
        completed_at: new Date().toISOString(),
      })
      .eq("id", step.id);

    // Check if all steps in mission are done
    const { data: remainingSteps } = await sb
      .from("ops_mission_steps")
      .select("status")
      .eq("mission_id", step.mission_id)
      .in("status", ["queued", "running"]);

    // If no more active steps, finalize mission
    if (!remainingSteps || remainingSteps.length === 0) {
      const { data: failedSteps } = await sb
        .from("ops_mission_steps")
        .select("id")
        .eq("mission_id", step.mission_id)
        .eq("status", "failed");

      const finalStatus = (failedSteps?.length ?? 0) > 0 ? "failed" : "succeeded";

      await sb
        .from("ops_missions")
        .update({
          status: finalStatus,
          completed_at: new Date().toISOString(),
        })
        .eq("id", step.mission_id);
    }

    // Log event
    await sb.from("ops_agent_events").insert({
      agent_id: "jarvis",
      event_type: "stale_recovery",
      title: `Recovered stale step (timed out)`,
      metadata: { step_id: step.id, mission_id: step.mission_id },
      tags: ["recovery", "timeout"],
    });

    recovered++;
  }

  return recovered;
}

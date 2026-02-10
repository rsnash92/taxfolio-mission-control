import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { evaluateTriggers } from "@/lib/trigger-evaluator";
import { processReactionQueue } from "@/lib/reaction-processor";
import { recoverStaleSteps } from "@/lib/stale-recovery";

export async function POST(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.HEARTBEAT_SECRET}`;

  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();

  try {
    const [triggersFired, reactionsProcessed, staleRecovered] =
      await Promise.all([
        evaluateTriggers(sb),
        processReactionQueue(sb),
        recoverStaleSteps(sb),
      ]);

    // Log heartbeat event
    await sb.from("ops_agent_events").insert({
      agent_id: "jarvis",
      event_type: "heartbeat",
      title: "System heartbeat",
      metadata: {
        triggers_fired: triggersFired,
        reactions_processed: reactionsProcessed,
        stale_recovered: staleRecovered,
      },
      tags: ["system", "heartbeat"],
    });

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      triggers_fired: triggersFired,
      reactions_processed: reactionsProcessed,
      stale_recovered: staleRecovered,
    });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json(
      { error: "Heartbeat failed", detail: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET - fetch pending approvals
export async function GET() {
  const sb = createServiceClient();

  const { data, error } = await sb
    .from("ops_human_approvals")
    .select("*, ops_review_reports(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH - approve or reject
export async function PATCH(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { id, action, notes } = body;

  if (!id || !["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Update approval status
  const { data, error } = await sb
    .from("ops_human_approvals")
    .update({
      status: action,
      rob_notes: notes ?? null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update the deliverable's status based on approval
  if (data) {
    const newStatus = action === "approved" ? "approved" : "rejected";
    await sb
      .from(data.deliverable_table)
      .update({ status: newStatus })
      .eq("id", data.deliverable_id);

    // Log event
    await sb.from("ops_agent_events").insert({
      agent_id: "jarvis",
      event_type: `human_${action}`,
      title: `Rob ${action}: ${data.title}`,
      metadata: { approval_id: id, notes },
      tags: ["human", action],
    });
  }

  return NextResponse.json(data);
}

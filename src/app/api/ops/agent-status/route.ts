import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("ops_agent_status")
    .select("*")
    .order("agent_id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const sb = createServiceClient();
  const { agent_id, is_active } = await req.json();

  if (!agent_id) {
    return NextResponse.json({ error: "agent_id is required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("ops_agent_status")
    .update({
      is_active,
      paused_at: is_active ? null : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("agent_id", agent_id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sb.from("ops_agent_events").insert({
    agent_id,
    event_type: is_active ? "agent_resumed" : "agent_paused",
    title: `${agent_id} ${is_active ? "resumed" : "paused"} by Rob`,
    tags: ["system"],
  });

  return NextResponse.json(data);
}

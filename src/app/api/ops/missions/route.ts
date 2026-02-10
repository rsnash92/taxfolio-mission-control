import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const agent = searchParams.get("agent");

  let query = sb
    .from("ops_missions")
    .select("*, ops_mission_steps(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (status) query = query.eq("status", status);
  if (agent) query = query.eq("agent_id", agent);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

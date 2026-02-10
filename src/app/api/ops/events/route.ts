import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100");
  const agent = searchParams.get("agent");

  let query = sb
    .from("ops_agent_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (agent && agent !== "all") query = query.eq("agent_id", agent);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

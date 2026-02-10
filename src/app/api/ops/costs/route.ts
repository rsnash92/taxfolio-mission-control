import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

interface CostRow {
  agent_id: string;
  input_tokens: number;
  output_tokens: number;
  search_queries: number;
  estimated_cost_gbp: string | number;
  duration_seconds: string | number | null;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "30d";
  const agent = searchParams.get("agent");

  const after = new Date();
  if (period === "7d") after.setDate(after.getDate() - 7);
  else if (period === "30d") after.setDate(after.getDate() - 30);
  else after.setFullYear(2020);

  let query = sb
    .from("ops_cost_log")
    .select("*")
    .gte("created_at", after.toISOString())
    .order("created_at", { ascending: false });

  if (agent) query = query.eq("agent_id", agent);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data || []) as CostRow[];

  const totals = {
    runs: rows.length,
    input_tokens: rows.reduce((s, r) => s + r.input_tokens, 0),
    output_tokens: rows.reduce((s, r) => s + r.output_tokens, 0),
    searches: rows.reduce((s, r) => s + r.search_queries, 0),
    total_cost_gbp: rows.reduce((s, r) => s + Number(r.estimated_cost_gbp), 0),
    avg_duration: rows.length
      ? rows.reduce((s, r) => s + Number(r.duration_seconds || 0), 0) / rows.length
      : 0,
  };

  const byAgent: Record<string, { runs: number; cost: number; tokens: number }> = {};
  rows.forEach((r) => {
    if (!byAgent[r.agent_id]) byAgent[r.agent_id] = { runs: 0, cost: 0, tokens: 0 };
    byAgent[r.agent_id].runs++;
    byAgent[r.agent_id].cost += Number(r.estimated_cost_gbp);
    byAgent[r.agent_id].tokens += r.input_tokens + r.output_tokens;
  });

  const byDay: Record<string, { cost: number; runs: number }> = {};
  rows.forEach((r) => {
    const day = r.created_at.split("T")[0];
    if (!byDay[day]) byDay[day] = { cost: 0, runs: 0 };
    byDay[day].cost += Number(r.estimated_cost_gbp);
    byDay[day].runs++;
  });

  return NextResponse.json({ totals, byAgent, byDay, rows });
}

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const competitor = searchParams.get("competitor");
  const significance = searchParams.get("significance");

  let query = sb
    .from("ops_competitor_intel")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (competitor && competitor !== "all") query = query.eq("competitor", competitor);
  if (significance && significance !== "all") query = query.eq("significance", significance);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

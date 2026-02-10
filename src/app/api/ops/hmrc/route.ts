import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const urgency = searchParams.get("urgency");

  let query = sb
    .from("ops_hmrc_updates")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (urgency && urgency !== "all") query = query.eq("urgency", urgency);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

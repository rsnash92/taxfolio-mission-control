import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createProposalAndMaybeAutoApprove } from "@/lib/proposal-service";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  const sb = createServiceClient();

  const { data, error } = await sb
    .from("ops_mission_proposals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();

  try {
    const result = await createProposalAndMaybeAutoApprove(sb, body);
    return NextResponse.json(result, {
      status: result.status === "rejected" ? 422 : 201,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

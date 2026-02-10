import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const sb = createServiceClient();
  const { data, error } = await sb.from("ops_policy").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { key, value } = body;

  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("ops_policy")
    .upsert({ key, value }, { onConflict: "key" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

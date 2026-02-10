import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");

  const { data, error } = await sb
    .from("ops_squad_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { content, agent_id, mentions } = body;

  if (!content || !agent_id) {
    return NextResponse.json({ error: "content and agent_id are required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("ops_squad_messages")
    .insert({
      agent_id,
      content,
      mentions: mentions ?? [],
      message_type: "update",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

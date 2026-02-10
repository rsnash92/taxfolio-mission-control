import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const sb = createServiceClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const contentType = searchParams.get("content_type");

  let query = sb
    .from("ops_content_drafts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status && status !== "all") query = query.eq("status", status);
  if (contentType && contentType !== "all") query = query.eq("content_type", contentType);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const sb = createServiceClient();
  const body = await req.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("ops_content_drafts")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

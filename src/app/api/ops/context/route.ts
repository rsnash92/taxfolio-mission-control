import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const sb = createServiceClient();
  const { data, error } = await sb
    .from("ops_project_context")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const sb = createServiceClient();
  const { id, content, title } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("ops_project_context")
    .update({ content, title, updated_at: new Date().toISOString(), updated_by: "rob" })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServiceClient();
  const { section, title, content } = await req.json();

  if (!section || !title) {
    return NextResponse.json({ error: "section and title are required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("ops_project_context")
    .insert({ section, title, content: content || "", updated_by: "rob" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const sb = createServiceClient();
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const { error } = await sb.from("ops_project_context").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

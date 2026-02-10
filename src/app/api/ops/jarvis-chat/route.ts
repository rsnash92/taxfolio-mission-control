import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServiceClient } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOOLS: Anthropic.Tool[] = [
  {
    name: "create_mission",
    description: "Create a new mission for an agent. Use when Rob agrees to proceed with a plan.",
    input_schema: {
      type: "object" as const,
      properties: {
        agent_id: { type: "string", enum: ["analyst", "scout", "writer", "growth", "reviewer", "dev"] },
        title: { type: "string" },
        description: { type: "string" },
        priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
        tags: { type: "array", items: { type: "string" } },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              kind: { type: "string" },
              title: { type: "string" },
              description: { type: "string" },
              input: { type: "object" },
            },
            required: ["kind", "title"],
          },
        },
      },
      required: ["agent_id", "title", "description", "steps"],
    },
  },
  {
    name: "check_agent_status",
    description: "Check what missions an agent currently has running or queued.",
    input_schema: {
      type: "object" as const,
      properties: {
        agent_id: { type: "string" },
      },
      required: ["agent_id"],
    },
  },
  {
    name: "read_project_context",
    description: "Read TaxFolio project context — what's built, priorities, SOPs, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        section: { type: "string", description: "Optional: specific section to read" },
      },
    },
  },
  {
    name: "read_recent_intel",
    description: "Read recent competitor intel, HMRC updates, or content drafts.",
    input_schema: {
      type: "object" as const,
      properties: {
        table: { type: "string", enum: ["ops_competitor_intel", "ops_hmrc_updates", "ops_content_drafts"] },
        limit: { type: "integer" },
      },
      required: ["table"],
    },
  },
];

interface ToolInput {
  agent_id?: string;
  title?: string;
  description?: string;
  priority?: string;
  tags?: string[];
  steps?: { kind: string; title: string; description?: string; input?: Record<string, unknown> }[];
  section?: string;
  table?: string;
  limit?: number;
}

async function executeTool(name: string, input: ToolInput) {
  const sb = createServiceClient();

  switch (name) {
    case "create_mission": {
      const { data: proposal } = await sb
        .from("ops_mission_proposals")
        .insert({
          agent_id: input.agent_id,
          title: input.title,
          description: input.description,
          priority: input.priority || "medium",
          source: "jarvis_chat",
          tags: input.tags || [],
          status: "accepted",
          decided_at: new Date().toISOString(),
        })
        .select()
        .single();

      const { data: mission } = await sb
        .from("ops_missions")
        .insert({
          proposal_id: proposal?.id,
          agent_id: input.agent_id,
          title: input.title,
          description: input.description,
          status: "queued",
          priority: input.priority || "medium",
          tags: input.tags || [],
        })
        .select()
        .single();

      for (let i = 0; i < (input.steps || []).length; i++) {
        const step = input.steps![i];
        await sb.from("ops_mission_steps").insert({
          mission_id: mission?.id,
          agent_id: input.agent_id,
          step_order: i + 1,
          kind: step.kind,
          title: step.title,
          description: step.description || "",
          input: step.input || {},
          status: "queued",
        });
      }

      await sb.from("ops_agent_events").insert({
        agent_id: input.agent_id,
        event_type: "mission_assigned",
        title: `Jarvis assigned: ${input.title}`,
        metadata: { mission_id: mission?.id, source: "jarvis_chat" },
        tags: ["mission_assigned"],
      });

      return { success: true, mission_id: mission?.id, agent: input.agent_id, steps: input.steps?.length };
    }

    case "check_agent_status": {
      const { data } = await sb
        .from("ops_missions")
        .select("id, title, status, priority, created_at")
        .eq("agent_id", input.agent_id!)
        .in("status", ["queued", "running"])
        .order("created_at", { ascending: false })
        .limit(5);
      return { agent: input.agent_id, active_missions: data };
    }

    case "read_project_context": {
      let query = sb.from("ops_project_context").select("section, title, content");
      if (input.section) query = query.eq("section", input.section);
      const { data } = await query;
      return { sections: data };
    }

    case "read_recent_intel": {
      const { data } = await sb
        .from(input.table!)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(input.limit || 5);
      return { rows: data, count: data?.length };
    }

    default:
      return { error: "Unknown tool" };
  }
}

const JARVIS_SYSTEM = `You are Jarvis, Rob's AI chief of staff for TaxFolio. You're having a direct conversation with Rob.

## How to behave in chat:
- Be concise and conversational — this is a chat, not a report
- Ask clarifying questions before creating missions — don't assume
- When Rob agrees to a plan, use create_mission to assign the work
- You can check agent workloads with check_agent_status before assigning
- You can read project context and recent intel to inform your answers
- When you create missions, confirm what you've dispatched

## Your team:
- Atlas (analyst): Competitor research, pricing analysis, market intel
- Sentinel (scout): HMRC monitoring, MTD updates, compliance
- Quill (writer): Blog posts, tax guides, SEO content
- Echo (growth): Tweets, social media, lead gen content
- Shield (reviewer): Quality review — gets triggered automatically by other agents
- Forge (dev): Code changes, features, bug fixes

## Rules:
- Don't create missions without Rob's approval unless he's told you to proceed
- If Rob says something vague like "sort out content", ask what specifically
- Summarise your plan before executing it
- Be honest about what agents can and can't do
- Keep it brief — Rob is busy`;

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  let currentMessages: Anthropic.MessageParam[] = messages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const maxTurns = 10;
  let turn = 0;
  let finalResponse = "";
  const missionsCreated: Record<string, unknown>[] = [];

  while (turn < maxTurns) {
    turn++;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: JARVIS_SYSTEM,
      tools: TOOLS,
      messages: currentMessages,
    });

    let hasToolUse = false;
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    let textContent = "";

    for (const block of response.content) {
      if (block.type === "text") {
        textContent += block.text;
      }
      if (block.type === "tool_use") {
        hasToolUse = true;
        const result = await executeTool(block.name, block.input as ToolInput);

        if (block.name === "create_mission") {
          missionsCreated.push({ ...(block.input as ToolInput), ...result });
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }
    }

    if (!hasToolUse) {
      finalResponse = textContent;
      break;
    }

    currentMessages = [
      ...currentMessages,
      { role: "assistant", content: response.content },
      { role: "user", content: toolResults },
    ];

    if (textContent) {
      finalResponse = textContent;
    }
  }

  return NextResponse.json({
    response: finalResponse,
    missions_created: missionsCreated,
  });
}

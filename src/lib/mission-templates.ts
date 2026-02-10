export interface MissionTemplate {
  label: string;
  agent_id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  tags: string[];
  steps: { kind: string; title: string }[];
}

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    label: "Competitor Scan",
    agent_id: "analyst",
    title: "Competitor Analysis",
    description: "Crawl and analyze competitor updates",
    priority: "medium",
    tags: ["competitor", "intel"],
    steps: [
      { kind: "crawl", title: "Crawl competitor sites" },
      { kind: "analyze", title: "Analyze findings" },
    ],
  },
  {
    label: "HMRC Check",
    agent_id: "scout",
    title: "HMRC Update Check",
    description: "Monitor HMRC for new updates and policy changes",
    priority: "high",
    tags: ["hmrc", "compliance"],
    steps: [
      { kind: "crawl", title: "Crawl HMRC pages" },
      { kind: "analyze", title: "Assess impact" },
    ],
  },
  {
    label: "Blog Post",
    agent_id: "writer",
    title: "Draft Blog Post",
    description: "Research topic and draft a blog post",
    priority: "medium",
    tags: ["content", "blog"],
    steps: [
      { kind: "research", title: "Research topic" },
      { kind: "draft_content", title: "Write blog post" },
    ],
  },
  {
    label: "Tweet Drafts",
    agent_id: "growth",
    title: "Draft Tweets",
    description: "Create engaging tweet drafts",
    priority: "low",
    tags: ["social", "twitter"],
    steps: [
      { kind: "draft_tweet", title: "Draft tweets" },
    ],
  },
  {
    label: "Code Task",
    agent_id: "dev",
    title: "Development Task",
    description: "Implement a code change",
    priority: "medium",
    tags: ["dev", "code"],
    steps: [
      { kind: "write_code", title: "Implement changes" },
    ],
  },
];

export const STEP_KINDS = [
  "crawl",
  "analyze",
  "research",
  "draft_content",
  "draft_tweet",
  "draft_email",
  "write_code",
  "review",
  "seo_report",
  "product_suggestion",
];

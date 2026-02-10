export const COLUMNS = [
  { key: "inbox", label: "INBOX", color: "#F59E0B", source: "proposals" as const },
  { key: "assigned", label: "ASSIGNED", color: "#64748B", source: "missions" as const },
  { key: "in_progress", label: "IN PROGRESS", color: "#3B82F6", source: "missions" as const },
  { key: "review", label: "REVIEW", color: "#8B5CF6", source: "approvals" as const },
  { key: "done", label: "DONE", color: "#10B981", source: "missions" as const },
];

export const VERDICT_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pass: { bg: "#D1FAE560", color: "#059669", label: "PASS" },
  pass_with_notes: { bg: "#FEF3C760", color: "#D97706", label: "PASS WITH NOTES" },
  fail: { bg: "#FEE2E260", color: "#DC2626", label: "FAIL" },
};

export const TYPE_ICONS: Record<string, string> = {
  content_draft: "\u{1F4DD}",
  tweet_draft: "\u{1F426}",
  dev_deliverable: "\u{1F4BB}",
  email: "\u{1F4E7}",
};

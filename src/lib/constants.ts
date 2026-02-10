export const COLUMNS = [
  { key: "queued", label: "Queued", color: "#64748B" },
  { key: "running", label: "In Progress", color: "#3B82F6" },
  { key: "succeeded", label: "Done", color: "#10B981" },
  { key: "failed", label: "Failed", color: "#EF4444" },
];

export const VERDICT_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pass: { bg: "#D1FAE530", color: "#6EE7B7", label: "PASS" },
  pass_with_notes: { bg: "#FEF3C730", color: "#FCD34D", label: "PASS WITH NOTES" },
  fail: { bg: "#FEE2E230", color: "#FCA5A5", label: "FAIL" },
};

export const TYPE_ICONS: Record<string, string> = {
  content_draft: "\u{1F4DD}",
  tweet_draft: "\u{1F426}",
  dev_deliverable: "\u{1F4BB}",
  email: "\u{1F4E7}",
};

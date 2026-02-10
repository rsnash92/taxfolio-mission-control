"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import ProjectContextEditor from "@/components/ops/ProjectContextEditor";

interface PolicyItem {
  key: string;
  value: Record<string, unknown>;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Editable values
  const [tweetQuota, setTweetQuota] = useState(10);
  const [contentQuota, setContentQuota] = useState(5);
  const [autoApproveEnabled, setAutoApproveEnabled] = useState(false);
  const [autoApproveKinds, setAutoApproveKinds] = useState<string[]>([]);

  const STEP_KINDS = ["crawl", "analyze", "write_blog", "write_tweet", "review", "code", "deploy"];

  useEffect(() => {
    fetch("/api/ops/settings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPolicies(data);
          for (const p of data) {
            const val = p.value as Record<string, unknown>;
            if (p.key === "x_daily_quota") setTweetQuota((val.limit as number) ?? 10);
            if (p.key === "content_daily_quota") setContentQuota((val.limit as number) ?? 5);
            if (p.key === "auto_approve") {
              setAutoApproveEnabled((val.enabled as boolean) ?? false);
              setAutoApproveKinds((val.auto_approve_kinds as string[]) ?? []);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveSetting = async (key: string, value: Record<string, unknown>) => {
    setSaving(key);
    try {
      await fetch("/api/ops/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      toast(`${key} updated`, "success");
    } catch {
      toast("Failed to save", "error");
    } finally {
      setSaving(null);
    }
  };

  const toggleAutoApproveKind = (kind: string) => {
    setAutoApproveKinds((prev) =>
      prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]
    );
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-[#6B6B6B] text-sm">Loading settings...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-base font-bold text-[#1A1A1A]">Settings</h1>

        {/* Quotas */}
        <section className="bg-white rounded-lg p-5 border border-[#E8E5E0] shadow-sm">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">Quotas</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#2D2D2D]">Tweet daily limit</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tweetQuota}
                  onChange={(e) => setTweetQuota(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-xs bg-[#F5F4F0] border border-[#E8E5E0] rounded text-[#1A1A1A] text-center focus:outline-none focus:border-[#E8952E]"
                />
                <button
                  onClick={() => saveSetting("x_daily_quota", { limit: tweetQuota })}
                  disabled={saving === "x_daily_quota"}
                  className="px-2.5 py-1 text-[10px] font-bold rounded bg-[#E8952E] text-white hover:bg-[#D4841F] disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#2D2D2D]">Content daily limit</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={contentQuota}
                  onChange={(e) => setContentQuota(parseInt(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-xs bg-[#F5F4F0] border border-[#E8E5E0] rounded text-[#1A1A1A] text-center focus:outline-none focus:border-[#E8952E]"
                />
                <button
                  onClick={() => saveSetting("content_daily_quota", { limit: contentQuota })}
                  disabled={saving === "content_daily_quota"}
                  className="px-2.5 py-1 text-[10px] font-bold rounded bg-[#E8952E] text-white hover:bg-[#D4841F] disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Auto-approve */}
        <section className="bg-white rounded-lg p-5 border border-[#E8E5E0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#1A1A1A]">Auto-Approve</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApproveEnabled}
                onChange={(e) => setAutoApproveEnabled(e.target.checked)}
                className="rounded accent-[#E8952E]"
              />
              <span className="text-[10px] font-semibold text-[#6B6B6B]">
                {autoApproveEnabled ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {STEP_KINDS.map((kind) => (
              <button
                key={kind}
                onClick={() => toggleAutoApproveKind(kind)}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded transition-colors ${
                  autoApproveKinds.includes(kind)
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-[#F5F4F0] text-[#6B6B6B] border border-[#E8E5E0]"
                }`}
              >
                {kind.replace(/_/g, " ")}
              </button>
            ))}
          </div>
          <button
            onClick={() => saveSetting("auto_approve", { enabled: autoApproveEnabled, auto_approve_kinds: autoApproveKinds })}
            disabled={saving === "auto_approve"}
            className="px-3 py-1.5 text-[10px] font-bold rounded bg-[#E8952E] text-white hover:bg-[#D4841F] disabled:opacity-50 transition-colors"
          >
            Save Auto-Approve Settings
          </button>
        </section>

        {/* Project Context Editor */}
        <ProjectContextEditor />

        {/* Raw policies (read-only view) */}
        <section className="bg-white rounded-lg p-5 border border-[#E8E5E0] shadow-sm">
          <h2 className="text-sm font-bold text-[#1A1A1A] mb-4">All Policies</h2>
          <div className="space-y-2">
            {policies.map((p) => (
              <div key={p.key} className="flex items-center justify-between bg-[#F5F4F0] rounded-lg p-3 border border-[#E8E5E0]">
                <span className="text-xs font-semibold text-[#1A1A1A]">{p.key}</span>
                <span className="text-[10px] text-[#6B6B6B] font-mono max-w-[300px] truncate">
                  {JSON.stringify(p.value)}
                </span>
              </div>
            ))}
            {policies.length === 0 && (
              <div className="text-center py-4 text-[11px] text-[#9CA3AF]">No policies configured</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

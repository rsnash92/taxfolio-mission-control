"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import type { ContextSection } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import Modal from "@/components/Modal";

const SECTION_ICONS: Record<string, string> = {
  product_overview: "\u{1F3E0}",
  feature_status: "\u26A1",
  priorities: "\u{1F3AF}",
  sops: "\u{1F4CB}",
  brand: "\u{1F3A8}",
  seo_keywords: "\u{1F50D}",
};

export default function ProjectContextEditor() {
  const { toast } = useToast();
  const [sections, setSections] = useState<ContextSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSection, setNewSection] = useState({ section: "", title: "", content: "" });

  useEffect(() => {
    fetch("/api/ops/context")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSections(data);
          if (data.length > 0) {
            setActiveSection(data[0].id);
            setEditContent(data[0].content);
            setEditTitle(data[0].title);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = sections.find((s) => s.id === activeSection);

  const selectSection = (s: ContextSection) => {
    setActiveSection(s.id);
    setEditContent(s.content);
    setEditTitle(s.title);
    setShowPreview(false);
  };

  const handleSave = async () => {
    if (!active) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ops/context", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id, content: editContent, title: editTitle }),
      });
      const updated = await res.json();
      if (updated.id) {
        setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast("Section saved", "success");
      } else {
        toast("Failed to save", "error");
      }
    } catch {
      toast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    if (!newSection.section || !newSection.title) {
      toast("Section key and title are required", "error");
      return;
    }
    try {
      const res = await fetch("/api/ops/context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSection),
      });
      const created = await res.json();
      if (created.id) {
        setSections((prev) => [...prev, created]);
        setActiveSection(created.id);
        setEditContent(created.content);
        setEditTitle(created.title);
        setShowAddModal(false);
        setNewSection({ section: "", title: "", content: "" });
        toast("Section created", "success");
      } else {
        toast("Failed to create section", "error");
      }
    } catch {
      toast("Failed to create section", "error");
    }
  };

  const handleDelete = async () => {
    if (!active) return;
    if (!confirm(`Delete "${active.title}"? This cannot be undone.`)) return;
    try {
      await fetch("/api/ops/context", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id }),
      });
      const remaining = sections.filter((s) => s.id !== active.id);
      setSections(remaining);
      if (remaining.length > 0) {
        selectSection(remaining[0]);
      } else {
        setActiveSection(null);
        setEditContent("");
        setEditTitle("");
      }
      toast("Section deleted", "success");
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    const lines = text.split("\n");
    const html = lines
      .map((line) => {
        if (line.startsWith("### ")) return `<h3 class="text-sm font-bold mt-3 mb-1">${line.slice(4)}</h3>`;
        if (line.startsWith("## ")) return `<h2 class="text-base font-bold mt-4 mb-1">${line.slice(3)}</h2>`;
        if (line.startsWith("# ")) return `<h1 class="text-lg font-bold mt-4 mb-2">${line.slice(2)}</h1>`;
        if (line.startsWith("- ")) return `<li class="ml-4 text-xs text-[#2D2D2D]">${line.slice(2)}</li>`;
        if (line.startsWith("**") && line.endsWith("**")) return `<p class="text-xs font-bold text-[#1A1A1A]">${line.slice(2, -2)}</p>`;
        if (line.trim() === "") return `<br/>`;
        return `<p class="text-xs text-[#2D2D2D] leading-relaxed">${line}</p>`;
      })
      .join("");
    return html;
  };

  if (loading) {
    return (
      <section className="bg-white rounded-lg p-5 border border-[#E8E5E0] shadow-sm">
        <div className="text-center py-8 text-[#6B6B6B] text-sm">Loading project context...</div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-white rounded-lg p-5 border border-[#E8E5E0] shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#1A1A1A]">Project Context</h2>
          <p className="text-[11px] text-[#6B6B6B] mt-1">
            The living briefing doc your agents read before every task. Keep this updated to improve agent work.
          </p>
        </div>

        {/* Section tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {sections.map((s) => {
            const icon = SECTION_ICONS[s.section] || "\u{1F4C4}";
            return (
              <button
                key={s.id}
                onClick={() => selectSection(s)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                  activeSection === s.id
                    ? "bg-[#E8952E] text-white"
                    : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
                }`}
              >
                {icon} {s.title}
              </button>
            );
          })}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0] transition-colors border border-dashed border-[#D4D1CC]"
          >
            + Add Section
          </button>
        </div>

        {/* Active section editor */}
        {active ? (
          <div className="border border-[#E8E5E0] rounded-lg p-4 bg-[#FAFAF8]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-sm font-semibold text-[#1A1A1A] bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                />
                <div className="text-[10px] text-[#9CA3AF] mt-0.5">
                  Last updated: {timeAgo(active.updated_at)} by {active.updated_by}
                </div>
              </div>
              <button
                onClick={handleDelete}
                className="text-[10px] text-red-400 hover:text-red-600 font-semibold transition-colors"
              >
                Delete
              </button>
            </div>

            {showPreview ? (
              <div
                className="min-h-[320px] bg-white rounded-md border border-[#E8E5E0] p-4 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }}
              />
            ) : (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={20}
                className="w-full bg-white border border-[#E8E5E0] rounded-md p-3 text-xs text-[#2D2D2D] font-mono leading-relaxed resize-y focus:outline-none focus:border-[#E8952E] min-h-[320px]"
                placeholder="Write your section content in markdown..."
              />
            )}

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-[10px] font-bold rounded bg-[#E8952E] text-white hover:bg-[#D4841F] disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-1.5 text-[10px] font-bold rounded bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0] border border-[#E8E5E0] transition-colors"
              >
                {showPreview ? "Edit" : "Preview"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">{"\u{1F4CB}"}</div>
            <div className="text-sm font-semibold text-[#6B6B6B]">No sections yet</div>
            <div className="text-[11px] text-[#9CA3AF] mt-1">
              Add your first section to start building your agent briefing doc
            </div>
          </div>
        )}
      </section>

      {/* Add Section Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Context Section">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold text-[#6B6B6B] uppercase mb-1 block">Section Key</label>
            <input
              type="text"
              value={newSection.section}
              onChange={(e) => setNewSection((prev) => ({ ...prev, section: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
              placeholder="e.g. product_overview"
              className="w-full px-3 py-2 text-xs bg-[#F5F4F0] border border-[#E8E5E0] rounded text-[#1A1A1A] focus:outline-none focus:border-[#E8952E]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#6B6B6B] uppercase mb-1 block">Title</label>
            <input
              type="text"
              value={newSection.title}
              onChange={(e) => setNewSection((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Product Overview"
              className="w-full px-3 py-2 text-xs bg-[#F5F4F0] border border-[#E8E5E0] rounded text-[#1A1A1A] focus:outline-none focus:border-[#E8952E]"
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-[#6B6B6B] uppercase mb-1 block">Content (optional)</label>
            <textarea
              value={newSection.content}
              onChange={(e) => setNewSection((prev) => ({ ...prev, content: e.target.value }))}
              rows={6}
              placeholder="Start writing or leave blank..."
              className="w-full px-3 py-2 text-xs bg-[#F5F4F0] border border-[#E8E5E0] rounded text-[#1A1A1A] font-mono focus:outline-none focus:border-[#E8952E] resize-y"
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-full px-3 py-2 text-xs font-bold rounded bg-[#E8952E] text-white hover:bg-[#D4841F] transition-colors"
          >
            Create Section
          </button>
        </div>
      </Modal>
    </>
  );
}

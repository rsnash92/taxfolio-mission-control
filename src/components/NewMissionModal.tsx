"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useToast } from "./Toast";
import { AGENTS } from "@/lib/agents";
import { MISSION_TEMPLATES, STEP_KINDS } from "@/lib/mission-templates";

interface NewMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface StepInput {
  kind: string;
  title: string;
}

export default function NewMissionModal({ isOpen, onClose, onCreated }: NewMissionModalProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [agentId, setAgentId] = useState("analyst");
  const [priority, setPriority] = useState<string>("medium");
  const [tagsInput, setTagsInput] = useState("");
  const [steps, setSteps] = useState<StepInput[]>([{ kind: "crawl", title: "" }]);

  const agentList = Object.values(AGENTS);
  const priorities = ["low", "medium", "high", "critical"];

  const applyTemplate = (tpl: typeof MISSION_TEMPLATES[number]) => {
    setTitle(tpl.title);
    setDescription(tpl.description);
    setAgentId(tpl.agent_id);
    setPriority(tpl.priority);
    setTagsInput(tpl.tags.join(", "));
    setSteps(tpl.steps.map((s) => ({ ...s })));
  };

  const addStep = () => {
    if (steps.length < 5) {
      setSteps([...steps, { kind: "crawl", title: "" }]);
    }
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: keyof StepInput, value: string) => {
    setSteps(steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAgentId("analyst");
    setPriority("medium");
    setTagsInput("");
    setSteps([{ kind: "crawl", title: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/ops/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: agentId,
          title: title.trim(),
          description: description.trim(),
          priority,
          source: "dashboard",
          tags,
          steps: steps
            .filter((s) => s.title.trim())
            .map((s) => ({ kind: s.kind, title: s.title.trim() })),
        }),
      });

      const result = await res.json();

      if (result.status === "auto_approved") {
        toast("Mission auto-approved and queued for execution", "success");
      } else if (result.status === "pending") {
        toast("Mission pending — needs manual approval", "info");
      } else if (result.status === "rejected") {
        toast(`Rejected: ${result.rejection_reason || "quota exceeded"}`, "error");
      } else {
        toast("Mission created", "success");
      }

      resetForm();
      onClose();
      onCreated();
    } catch {
      toast("Failed to create mission", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Mission" wide>
      <div className="mb-5">
        <div className="text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">
          Quick Templates
        </div>
        <div className="flex flex-wrap gap-1.5">
          {MISSION_TEMPLATES.map((tpl) => (
            <button
              key={tpl.label}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="px-2.5 py-1 text-[10px] font-semibold bg-[#F5F4F0] text-[#2D2D2D] rounded hover:bg-[#E8E5E0] transition-colors"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E] focus:ring-1 focus:ring-[#E8952E]"
            placeholder="Mission title"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">
              Assign to
            </label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#E8952E]"
            >
              {agentList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.icon} {a.name} — {a.role}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">
              Priority
            </label>
            <div className="flex gap-1.5">
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded capitalize transition-colors ${
                    priority === p
                      ? "bg-[#E8952E] text-white"
                      : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E] focus:ring-1 focus:ring-[#E8952E] resize-none"
            placeholder="What should the agent do?"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E] focus:ring-1 focus:ring-[#E8952E]"
            placeholder="blog, seo, q1-2026"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">
            Steps
          </label>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-[10px] text-[#6B6B6B] w-4 shrink-0">{i + 1}.</span>
                <select
                  value={step.kind}
                  onChange={(e) => updateStep(i, "kind", e.target.value)}
                  className="w-36 px-2 py-1.5 bg-[#F5F4F0] border border-[#E8E5E0] rounded text-[11px] text-[#1A1A1A] focus:outline-none focus:border-[#E8952E]"
                >
                  {STEP_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStep(i, "title", e.target.value)}
                  className="flex-1 px-2 py-1.5 bg-[#F5F4F0] border border-[#E8E5E0] rounded text-[11px] text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E]"
                  placeholder="Step title"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(i)}
                    className="text-[#9CA3AF] hover:text-red-500 text-xs transition-colors"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>
          {steps.length < 5 && (
            <button
              type="button"
              onClick={addStep}
              className="mt-2 text-[10px] text-[#E8952E] hover:text-[#D4841F] font-semibold transition-colors"
            >
              + Add Step
            </button>
          )}
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-[#E8E5E0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[11px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="px-4 py-2 text-[11px] font-bold rounded-md bg-[#E8952E] text-white hover:bg-[#D4841F] disabled:opacity-50 transition-colors"
          >
            {submitting ? "Creating..." : "Create Mission"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

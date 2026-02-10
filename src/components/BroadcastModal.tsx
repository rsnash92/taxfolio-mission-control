"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useToast } from "./Toast";

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export default function BroadcastModal({ isOpen, onClose, onSent }: BroadcastModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"normal" | "urgent">("normal");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setPriority("normal");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await fetch("/api/ops/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: "jarvis",
          title: title.trim() || message.trim().slice(0, 60),
          description: message.trim(),
          priority: priority === "urgent" ? "critical" : "medium",
          source: "api",
          tags: ["broadcast", "human-directive"],
          steps: [
            {
              kind: "analyze",
              title: "Decompose broadcast into agent tasks",
              input: { broadcast_message: message.trim(), priority },
            },
          ],
        }),
      });

      toast("Broadcast sent to Jarvis for decomposition", "success");
      resetForm();
      onClose();
      onSent();
    } catch {
      toast("Failed to send broadcast", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Squad Announcement">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E] focus:ring-1 focus:ring-[#E8952E]"
            placeholder="Brief title for the announcement"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-1">
            Message *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={4}
            className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E8E5E0] rounded-lg text-sm text-[#1A1A1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E8952E] focus:ring-1 focus:ring-[#E8952E] resize-none"
            placeholder="Write your instructions to the squad..."
            autoFocus
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#6B6B6B] uppercase tracking-wider mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPriority("normal")}
              className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-lg transition-colors ${
                priority === "normal"
                  ? "bg-[#E8952E] text-white"
                  : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
              }`}
            >
              NORMAL
            </button>
            <button
              type="button"
              onClick={() => setPriority("urgent")}
              className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-lg transition-colors ${
                priority === "urgent"
                  ? "bg-red-500 text-white"
                  : "bg-[#F5F4F0] text-[#6B6B6B] hover:bg-[#E8E5E0]"
              }`}
            >
              URGENT
            </button>
          </div>
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
            disabled={submitting || !message.trim()}
            className="px-4 py-2 text-[11px] font-bold rounded-md bg-[#E8952E] text-white hover:bg-[#D4841F] disabled:opacity-50 transition-colors"
          >
            {submitting ? "Sending..." : "Broadcast to Squad"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import Modal from "./Modal";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (notes: string) => void;
  title: string;
}

export default function RejectModal({ isOpen, onClose, onReject, title }: RejectModalProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReject(notes);
    setNotes("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Deliverable">
      <form onSubmit={handleSubmit}>
        <p className="text-xs text-slate-400 mb-3">
          Rejecting: <span className="text-slate-200 font-semibold">{title}</span>
        </p>
        <div className="mb-4">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Reason / Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
            placeholder="Why are you rejecting this?"
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-[11px] font-bold rounded-md bg-red-900/40 border border-red-900/60 text-red-300 hover:bg-red-900/60 transition-colors"
          >
            Reject
          </button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";

interface DeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: string;
  id: string;
}

export default function DeliverableModal({ isOpen, onClose, table, id }: DeliverableModalProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !table || !id) return;
    setLoading(true);
    fetch(`/api/ops/deliverables/${table}/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [isOpen, table, id]);

  const renderContent = () => {
    if (loading) return <div className="text-[#6B6B6B] text-sm py-8 text-center">Loading...</div>;
    if (!data) return <div className="text-[#6B6B6B] text-sm py-8 text-center">Could not load deliverable</div>;

    if (table === "ops_tweet_drafts") {
      const text = (data.tweet_text || data.body || "") as string;
      return (
        <div>
          <div className="bg-[#F5F4F0] rounded-lg p-4 border border-[#E8E5E0]">
            <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{text}</p>
          </div>
          <div className="mt-2 text-[10px] text-[#6B6B6B]">{text.length}/280 characters</div>
        </div>
      );
    }

    if (table === "ops_content_drafts") {
      const body = (data.body || data.content || "") as string;
      const title = (data.title || "") as string;
      return (
        <div>
          {title && <h3 className="text-base font-bold text-[#1A1A1A] mb-3">{title}</h3>}
          <div className="bg-[#F5F4F0] rounded-lg p-4 border border-[#E8E5E0] max-h-[50vh] overflow-y-auto">
            <div className="text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-wrap">{body}</div>
          </div>
          <div className="mt-2 text-[10px] text-[#6B6B6B]">
            {body.split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
      );
    }

    const title = (data.title || "") as string;
    const description = (data.description || data.body || "") as string;
    return (
      <div>
        {title && <h3 className="text-base font-bold text-[#1A1A1A] mb-3">{title}</h3>}
        <div className="bg-[#F5F4F0] rounded-lg p-4 border border-[#E8E5E0] max-h-[50vh] overflow-y-auto">
          <pre className="text-xs text-[#2D2D2D] leading-relaxed whitespace-pre-wrap font-mono">{description}</pre>
        </div>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deliverable" wide>
      {renderContent()}
    </Modal>
  );
}

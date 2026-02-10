"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function SlideOver({ isOpen, onClose, title, children }: SlideOverProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="ml-auto relative w-full max-w-xl bg-white border-l border-[#E8E5E0] shadow-lg flex flex-col h-full">
        {title && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8E5E0] shrink-0">
            <h2 className="text-sm font-bold text-[#1A1A1A]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

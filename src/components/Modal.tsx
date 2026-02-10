"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  wide?: boolean;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, wide, children }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        className={`relative bg-white border border-[#E8E5E0] rounded-xl shadow-lg max-h-[85vh] overflow-y-auto ${
          wide ? "w-full max-w-2xl" : "w-full max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E8E5E0]">
            <h2 className="text-sm font-bold text-[#1A1A1A]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

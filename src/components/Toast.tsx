"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const colors: Record<ToastType, string> = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-white border-[#E8E5E0] text-[#1A1A1A]",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`px-4 py-2.5 rounded-lg border text-xs font-semibold shadow-sm ${colors[t.type]}`}
              >
                {t.message}
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

import { useEffect } from "react";

interface ShortcutHandlers {
  onNewMission?: () => void;
  onBroadcast?: () => void;
  onChat?: () => void;
  onJarvis?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          handlers.onNewMission?.();
          break;
        case "b":
          e.preventDefault();
          handlers.onBroadcast?.();
          break;
        case "c":
          e.preventDefault();
          handlers.onChat?.();
          break;
        case "j":
          e.preventDefault();
          handlers.onJarvis?.();
          break;
        case "escape":
          handlers.onEscape?.();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers]);
}

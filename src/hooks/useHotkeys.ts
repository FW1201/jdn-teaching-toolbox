import { useEffect, useRef } from "react";

export interface GlobalHotkeyHandlers {
  /** Cmd/Ctrl + K */
  onCommandPalette: () => void;
  /** "/"（非輸入框焦點時） */
  onFocusSearch: () => void;
  /** Esc：由呼叫端決定優先序（關 palette → 退出工具） */
  onEscape: (inEditable: boolean) => void;
  /** Cmd/Ctrl + Shift + P */
  onToggleProjection: () => void;
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable;
}

export function useGlobalHotkeys(handlers: GlobalHotkeyHandlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const current = handlersRef.current;
      const mod = event.metaKey || event.ctrlKey;

      if (mod && !event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        current.onCommandPalette();
        return;
      }
      if (mod && event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        current.onToggleProjection();
        return;
      }
      if (event.key === "Escape") {
        current.onEscape(isEditable(event.target));
        return;
      }
      if (event.key === "/" && !mod && !isEditable(event.target)) {
        event.preventDefault();
        current.onFocusSearch();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

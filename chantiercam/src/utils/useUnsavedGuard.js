import { useEffect } from "react";

// Warns before the browser tab is closed/refreshed while `active` (dirty form) is true.
export function useUnsavedGuard(active) {
  useEffect(() => {
    if (!active) return;
    function handler(e) {
      e.preventDefault();
      e.returnValue = "";
      return "";
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}

// Call before closing a modal/form. Returns true if it's OK to close.
export function confirmDiscard(dirty, t) {
  if (!dirty) return true;
  return window.confirm(t ? t("discardChangesConfirm") : "Discard unsaved changes?");
}

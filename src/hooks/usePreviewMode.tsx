import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type PreviewAccessMode = "off" | "subscriber" | "free" | "logged-out";

interface PreviewModeContextType {
  mode: PreviewAccessMode;
  setMode: (m: PreviewAccessMode) => void;
  isPreviewEnvironment: boolean;
}

const PreviewModeContext = createContext<PreviewModeContextType | null>(null);

const STORAGE_KEY = "synctuary_preview_access_mode";

/**
 * Detects if we're running in a non-production environment where the
 * dev preview toolbar should be available. This includes:
 * - Vite dev mode
 * - Lovable preview iframes (*.lovable.app, *.lovableproject.com)
 * It is NEVER active on the published custom domain or in a real
 * production build deployed elsewhere.
 */
function detectPreviewEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  if (import.meta.env.DEV) return true;
  const host = window.location.hostname;
  // Lovable preview/sandbox hosts
  if (host.endsWith(".lovableproject.com")) return true;
  if (host.includes("id-preview--") && host.endsWith(".lovable.app")) return true;
  return false;
}

export function PreviewModeProvider({ children }: { children: ReactNode }) {
  const isPreviewEnvironment = detectPreviewEnvironment();
  const [mode, setModeState] = useState<PreviewAccessMode>(() => {
    if (!isPreviewEnvironment) return "off";
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as PreviewAccessMode | null;
      if (stored === "subscriber" || stored === "free" || stored === "logged-out") {
        return stored;
      }
    } catch {}
    return "off";
  });

  const setMode = useCallback((m: PreviewAccessMode) => {
    setModeState(m);
    try {
      if (m === "off") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, m);
    } catch {}
  }, []);

  // Production safety: force-off if not in a preview environment
  useEffect(() => {
    if (!isPreviewEnvironment && mode !== "off") {
      setModeState("off");
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, [isPreviewEnvironment, mode]);

  return (
    <PreviewModeContext.Provider value={{ mode, setMode, isPreviewEnvironment }}>
      {children}
    </PreviewModeContext.Provider>
  );
}

export function usePreviewMode() {
  const ctx = useContext(PreviewModeContext);
  if (!ctx) {
    // Safe fallback so consumers never crash if provider missing
    return { mode: "off" as PreviewAccessMode, setMode: () => {}, isPreviewEnvironment: false };
  }
  return ctx;
}

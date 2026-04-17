import { useState } from "react";
import { Crown, User, UserX, Eye, X, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { usePreviewMode, type PreviewAccessMode } from "@/hooks/usePreviewMode";

const OPTIONS: { id: PreviewAccessMode; label: string; icon: typeof Crown }[] = [
  { id: "off", label: "Off (real auth)", icon: Eye },
  { id: "subscriber", label: "Paid Subscriber", icon: Crown },
  { id: "free", label: "Free User", icon: User },
  { id: "logged-out", label: "Logged-out Visitor", icon: UserX },
];

export default function PreviewModeToolbar() {
  const { mode, setMode, isPreviewEnvironment } = usePreviewMode();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!isPreviewEnvironment) return null;

  const active = OPTIONS.find((o) => o.id === mode) ?? OPTIONS[0];
  const ActiveIcon = active.icon;

  return (
    <div className="fixed top-3 right-3 z-[9999] font-sans" style={{ fontFamily: "ui-sans-serif, system-ui" }}>
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/80 text-white text-xs shadow-lg backdrop-blur hover:bg-black"
          title="Show preview toolbar"
        >
          <Eye size={12} />
          {mode !== "off" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>
      ) : (
        <div className="rounded-xl bg-black/85 text-white shadow-2xl backdrop-blur border border-white/10 overflow-hidden min-w-[220px]">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/60">
              <Zap size={10} />
              Preview Mode
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="text-white/50 hover:text-white p-0.5"
              title="Collapse"
            >
              <X size={12} />
            </button>
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-white/5 text-left"
          >
            <div className="flex items-center gap-2">
              <ActiveIcon size={14} className={mode === "subscriber" ? "text-amber-400" : "text-white/80"} />
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 leading-none">Access mode</span>
                <span className="text-xs font-medium leading-tight mt-0.5">{active.label}</span>
              </div>
            </div>
            {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {open && (
            <div className="border-t border-white/10 py-1">
              {OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = opt.id === mode;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setMode(opt.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-white/10 ${
                      isActive ? "bg-white/5 text-amber-300" : "text-white/90"
                    }`}
                  >
                    <Icon size={12} />
                    {opt.label}
                    {isActive && <span className="ml-auto text-[10px] text-amber-300">●</span>}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setMode("subscriber")}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] bg-amber-500/90 hover:bg-amber-500 text-black font-medium border-t border-white/10"
          >
            <Crown size={11} /> Bypass Paywall
          </button>

          <div className="px-3 py-1.5 text-[9px] text-white/40 border-t border-white/10 leading-snug">
            Dev only — never affects production users.
          </div>
        </div>
      )}
    </div>
  );
}

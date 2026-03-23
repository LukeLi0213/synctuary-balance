import { useThemeSettings, type ColorPalette, type FontType, type FontSize } from "@/hooks/useThemeSettings";
import { Check } from "lucide-react";

const PALETTE_OPTIONS: { id: ColorPalette; label: string; preview: string[] }[] = [
  { id: "green", label: "Sage (Default)", preview: ["hsl(145,30%,42%)", "hsl(36,80%,56%)", "hsl(40,33%,98%)"] },
  { id: "dark", label: "Dark Mode", preview: ["hsl(220,60%,55%)", "hsl(45,80%,55%)", "hsl(220,15%,10%)"] },
  { id: "pink", label: "Rose", preview: ["hsl(340,55%,55%)", "hsl(20,80%,58%)", "hsl(340,30%,97%)"] },
  { id: "ocean", label: "Ocean", preview: ["hsl(195,70%,42%)", "hsl(170,60%,45%)", "hsl(200,30%,97%)"] },
  { id: "rainbow", label: "Rainbow", preview: ["hsl(270,55%,55%)", "hsl(45,85%,55%)", "hsl(270,20%,97%)"] },
  { id: "lavender", label: "Lavender", preview: ["hsl(260,45%,58%)", "hsl(330,50%,60%)", "hsl(260,25%,97%)"] },
];

const FONT_OPTIONS: { id: FontType; label: string; sample: string }[] = [
  { id: "dm-sans", label: "DM Sans", sample: "font-sans" },
  { id: "inter", label: "Inter", sample: "" },
  { id: "georgia", label: "Georgia", sample: "" },
  { id: "mono", label: "Monospace", sample: "font-mono" },
  { id: "system", label: "System", sample: "" },
];

const SIZE_OPTIONS: { id: FontSize; label: string }[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

export default function SettingsPage() {
  const { palette, fontType, fontSize, setPalette, setFontType, setFontSize } = useThemeSettings();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Personalize your Synctuary experience</p>
        </div>

        {/* Color Palette */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Color Palette</h2>
          <div className="grid grid-cols-2 gap-3">
            {PALETTE_OPTIONS.map((opt) => {
              const active = palette === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setPalette(opt.id)}
                  className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 ${
                    active
                      ? "border-primary bg-secondary"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex gap-1">
                    {opt.preview.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full border border-border/50"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  {active && (
                    <Check size={16} className="absolute top-2 right-2 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Font Type */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Font Style</h2>
          <div className="grid grid-cols-1 gap-2">
            {FONT_OPTIONS.map((opt) => {
              const active = fontType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFontType(opt.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 ${
                    active
                      ? "border-primary bg-secondary"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span
                    className="text-sm text-foreground"
                    style={{
                      fontFamily:
                        opt.id === "dm-sans" ? "'DM Sans'" :
                        opt.id === "inter" ? "'Inter'" :
                        opt.id === "georgia" ? "Georgia" :
                        opt.id === "mono" ? "monospace" : "system-ui",
                    }}
                  >
                    {opt.label} — The quick brown fox
                  </span>
                  {active && <Check size={16} className="text-primary" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Font Size */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Font Size</h2>
          <div className="flex gap-2">
            {SIZE_OPTIONS.map((opt) => {
              const active = fontSize === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFontSize(opt.id)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

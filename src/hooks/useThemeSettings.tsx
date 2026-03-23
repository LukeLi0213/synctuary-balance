import React, { createContext, useContext, useEffect, useState } from "react";

export type ColorPalette = "green" | "dark" | "pink" | "ocean" | "rainbow" | "lavender";
export type FontType = "dm-sans" | "inter" | "georgia" | "mono" | "system";
export type FontSize = "small" | "medium" | "large";

interface ThemeSettings {
  palette: ColorPalette;
  fontType: FontType;
  fontSize: FontSize;
  setPalette: (p: ColorPalette) => void;
  setFontType: (f: FontType) => void;
  setFontSize: (s: FontSize) => void;
}

const ThemeContext = createContext<ThemeSettings | null>(null);

const PALETTES: Record<ColorPalette, Record<string, string>> = {
  green: {
    "--background": "40 33% 98%",
    "--foreground": "150 10% 15%",
    "--card": "40 25% 97%",
    "--card-foreground": "150 10% 15%",
    "--primary": "145 30% 42%",
    "--primary-foreground": "40 33% 98%",
    "--secondary": "145 20% 92%",
    "--secondary-foreground": "145 30% 30%",
    "--muted": "40 15% 94%",
    "--muted-foreground": "150 8% 48%",
    "--accent": "36 80% 56%",
    "--accent-foreground": "36 80% 18%",
    "--border": "145 15% 88%",
    "--input": "145 15% 88%",
    "--ring": "145 30% 42%",
    "--energy-high": "145 45% 52%",
    "--energy-medium": "36 80% 56%",
    "--energy-low": "0 60% 58%",
    "--xp-gold": "42 85% 55%",
    "--recovery": "220 50% 62%",
  },
  dark: {
    "--background": "220 15% 10%",
    "--foreground": "220 10% 90%",
    "--card": "220 15% 13%",
    "--card-foreground": "220 10% 90%",
    "--primary": "220 60% 55%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "220 15% 20%",
    "--secondary-foreground": "220 20% 75%",
    "--muted": "220 10% 18%",
    "--muted-foreground": "220 10% 55%",
    "--accent": "45 80% 55%",
    "--accent-foreground": "45 80% 15%",
    "--border": "220 10% 22%",
    "--input": "220 10% 22%",
    "--ring": "220 60% 55%",
    "--energy-high": "145 45% 52%",
    "--energy-medium": "36 80% 56%",
    "--energy-low": "0 60% 58%",
    "--xp-gold": "42 85% 55%",
    "--recovery": "220 50% 62%",
  },
  pink: {
    "--background": "340 30% 97%",
    "--foreground": "340 15% 15%",
    "--card": "340 25% 96%",
    "--card-foreground": "340 15% 15%",
    "--primary": "340 55% 55%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "340 30% 92%",
    "--secondary-foreground": "340 40% 35%",
    "--muted": "340 15% 94%",
    "--muted-foreground": "340 10% 48%",
    "--accent": "20 80% 58%",
    "--accent-foreground": "20 80% 18%",
    "--border": "340 20% 88%",
    "--input": "340 20% 88%",
    "--ring": "340 55% 55%",
    "--energy-high": "145 45% 52%",
    "--energy-medium": "36 80% 56%",
    "--energy-low": "0 60% 58%",
    "--xp-gold": "42 85% 55%",
    "--recovery": "280 50% 62%",
  },
  ocean: {
    "--background": "200 30% 97%",
    "--foreground": "200 15% 12%",
    "--card": "200 25% 96%",
    "--card-foreground": "200 15% 12%",
    "--primary": "195 70% 42%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "195 25% 90%",
    "--secondary-foreground": "195 40% 30%",
    "--muted": "200 15% 93%",
    "--muted-foreground": "200 10% 48%",
    "--accent": "170 60% 45%",
    "--accent-foreground": "170 60% 12%",
    "--border": "195 18% 87%",
    "--input": "195 18% 87%",
    "--ring": "195 70% 42%",
    "--energy-high": "170 50% 48%",
    "--energy-medium": "36 80% 56%",
    "--energy-low": "0 60% 58%",
    "--xp-gold": "42 85% 55%",
    "--recovery": "210 55% 58%",
  },
  rainbow: {
    "--background": "270 20% 97%",
    "--foreground": "270 10% 12%",
    "--card": "270 15% 96%",
    "--card-foreground": "270 10% 12%",
    "--primary": "270 55% 55%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "330 30% 92%",
    "--secondary-foreground": "330 40% 35%",
    "--muted": "200 15% 93%",
    "--muted-foreground": "270 8% 48%",
    "--accent": "45 85% 55%",
    "--accent-foreground": "45 85% 15%",
    "--border": "270 15% 88%",
    "--input": "270 15% 88%",
    "--ring": "270 55% 55%",
    "--energy-high": "145 50% 50%",
    "--energy-medium": "36 85% 55%",
    "--energy-low": "0 65% 55%",
    "--xp-gold": "42 85% 55%",
    "--recovery": "200 55% 58%",
  },
  lavender: {
    "--background": "260 25% 97%",
    "--foreground": "260 12% 15%",
    "--card": "260 20% 96%",
    "--card-foreground": "260 12% 15%",
    "--primary": "260 45% 58%",
    "--primary-foreground": "0 0% 100%",
    "--secondary": "260 25% 92%",
    "--secondary-foreground": "260 30% 35%",
    "--muted": "260 12% 94%",
    "--muted-foreground": "260 8% 50%",
    "--accent": "330 50% 60%",
    "--accent-foreground": "330 50% 15%",
    "--border": "260 15% 88%",
    "--input": "260 15% 88%",
    "--ring": "260 45% 58%",
    "--energy-high": "145 45% 52%",
    "--energy-medium": "36 80% 56%",
    "--energy-low": "0 60% 58%",
    "--xp-gold": "42 85% 55%",
    "--recovery": "260 45% 58%",
  },
};

const FONT_FAMILIES: Record<FontType, string> = {
  "dm-sans": "'DM Sans', system-ui, sans-serif",
  inter: "'Inter', system-ui, sans-serif",
  georgia: "Georgia, 'Times New Roman', serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  system: "system-ui, -apple-system, sans-serif",
};

const FONT_SIZES: Record<FontSize, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
};

function loadSettings() {
  try {
    const raw = localStorage.getItem("synctuary-theme");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { palette: "green", fontType: "dm-sans", fontSize: "medium" };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const saved = loadSettings();
  const [palette, setPalette] = useState<ColorPalette>(saved.palette);
  const [fontType, setFontType] = useState<FontType>(saved.fontType);
  const [fontSize, setFontSize] = useState<FontSize>(saved.fontSize);

  useEffect(() => {
    localStorage.setItem("synctuary-theme", JSON.stringify({ palette, fontType, fontSize }));
    const root = document.documentElement;
    const vars = PALETTES[palette];
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.style.setProperty("--font-body", FONT_FAMILIES[fontType]);
    root.style.fontSize = FONT_SIZES[fontSize];
  }, [palette, fontType, fontSize]);

  return (
    <ThemeContext.Provider value={{ palette, fontType, fontSize, setPalette, setFontType, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeSettings() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeSettings must be used within ThemeProvider");
  return ctx;
}

export { PALETTES, FONT_FAMILIES, FONT_SIZES };
export type { ThemeSettings };

import { useState } from "react";
import { useThemeSettings, type ColorPalette, type FontType, type FontSize } from "@/hooks/useThemeSettings";
import { useAuth } from "@/hooks/useAuth";
import { Check, Crown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import UpgradeModal from "@/components/UpgradeModal";
import { toast } from "@/hooks/use-toast";

const PALETTE_OPTIONS: { id: ColorPalette; label: string; preview: string[] }[] = [
  { id: "green", label: "Sage (Default)", preview: ["hsl(145,30%,42%)", "hsl(36,80%,56%)", "hsl(40,33%,98%)"] },
  { id: "dark", label: "Dark Mode", preview: ["hsl(220,60%,55%)", "hsl(45,80%,55%)", "hsl(220,15%,10%)"] },
  { id: "pink", label: "Rose", preview: ["hsl(340,55%,55%)", "hsl(20,80%,58%)", "hsl(340,30%,97%)"] },
  { id: "ocean", label: "Ocean", preview: ["hsl(195,70%,42%)", "hsl(170,60%,45%)", "hsl(200,30%,97%)"] },
  { id: "rainbow", label: "Rainbow", preview: ["hsl(270,55%,55%)", "hsl(45,85%,55%)", "hsl(270,20%,97%)"] },
  { id: "lavender", label: "Lavender", preview: ["hsl(260,45%,58%)", "hsl(330,50%,60%)", "hsl(260,25%,97%)"] },
];

const FONT_OPTIONS: { id: FontType; label: string }[] = [
  { id: "dm-sans", label: "DM Sans" },
  { id: "inter", label: "Inter" },
  { id: "georgia", label: "Georgia" },
  { id: "mono", label: "Monospace" },
  { id: "system", label: "System" },
];

const SIZE_OPTIONS: { id: FontSize; label: string }[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

export default function SettingsPage() {
  const { palette, fontType, fontSize, setPalette, setFontType, setFontSize } = useThemeSettings();
  const { user, isSubscribed, subscriptionEnd, signOut, checkSubscription } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const isPremiumPalette = (id: ColorPalette) => id !== "green";
  const isPremiumFont = (id: FontType) => id !== "dm-sans";
  const isPremiumSize = (id: FontSize) => id !== "medium";

  const handlePalette = (id: ColorPalette) => {
    if (isPremiumPalette(id) && !isSubscribed) {
      setShowUpgrade(true);
      return;
    }
    setPalette(id);
  };

  const handleFont = (id: FontType) => {
    if (isPremiumFont(id) && !isSubscribed) {
      setShowUpgrade(true);
      return;
    }
    setFontType(id);
  };

  const handleSize = (id: FontSize) => {
    if (isPremiumSize(id) && !isSubscribed) {
      setShowUpgrade(true);
      return;
    }
    setFontSize(id);
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not open subscription portal", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Personalize your Synctuary experience</p>
        </div>

        {/* Subscription */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
          {isSubscribed ? (
            <div className="p-4 rounded-2xl border-2 border-primary bg-secondary space-y-3">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-primary" />
                <span className="font-semibold text-foreground">Synctuary Pro</span>
              </div>
              {subscriptionEnd && (
                <p className="text-sm text-muted-foreground">
                  Renews on {new Date(subscriptionEnd).toLocaleDateString()}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="gap-1"
              >
                <ExternalLink size={14} />
                {portalLoading ? "Opening…" : "Manage Subscription"}
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border-2 border-border bg-card space-y-3">
              <p className="text-sm text-muted-foreground">
                Upgrade to <strong>Synctuary Pro</strong> to unlock Calendar, Groups, and custom themes.
              </p>
              <Button onClick={() => setShowUpgrade(true)} className="gap-2">
                <Crown size={16} /> Upgrade — $5/month
              </Button>
            </div>
          )}
        </section>

        {/* Color Palette */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Color Palette</h2>
          <div className="grid grid-cols-2 gap-3">
            {PALETTE_OPTIONS.map((opt) => {
              const active = palette === opt.id;
              const locked = isPremiumPalette(opt.id) && !isSubscribed;
              return (
                <button
                  key={opt.id}
                  onClick={() => handlePalette(opt.id)}
                  className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200 ${
                    active
                      ? "border-primary bg-secondary"
                      : "border-border bg-card hover:border-primary/40"
                  } ${locked ? "opacity-60" : ""}`}
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
                  {locked && <Crown size={14} className="absolute top-2 right-2 text-muted-foreground" />}
                  {active && !locked && <Check size={16} className="absolute top-2 right-2 text-primary" />}
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
              const locked = isPremiumFont(opt.id) && !isSubscribed;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleFont(opt.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 ${
                    active
                      ? "border-primary bg-secondary"
                      : "border-border bg-card hover:border-primary/40"
                  } ${locked ? "opacity-60" : ""}`}
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
                  {locked && <Crown size={14} className="text-muted-foreground" />}
                  {active && !locked && <Check size={16} className="text-primary" />}
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
              const locked = isPremiumSize(opt.id) && !isSubscribed;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSize(opt.id)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  } ${locked ? "opacity-60" : ""}`}
                >
                  {opt.label}
                  {locked && " 👑"}
                </button>
              );
            })}
          </div>
        </section>

        {/* Account */}
        {user && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Account</h2>
            <div className="p-4 rounded-2xl border-2 border-border bg-card space-y-2">
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </section>
        )}
      </div>

      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} feature="Theme Customization" />
    </div>
  );
}

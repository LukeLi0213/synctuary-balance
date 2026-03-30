import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Calendar, Users, Palette, Check, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

const PRO_FEATURES = [
  { icon: Calendar, label: "Calendar use & incorporation of Google Calendar (.ics import)" },
  { icon: Users, label: "See what your friends are doing in the Group function" },
  { icon: Palette, label: "Customizable themes — fonts, color palettes, and font sizes" },
];

export default function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not start checkout", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="text-accent" size={24} />
            Upgrade to Synctuary Pro
          </DialogTitle>
          <DialogDescription>
            {feature
              ? `${feature} is a Pro feature. Upgrade to unlock it and more!`
              : "Unlock all premium features for $5/month."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What's included</p>
          {PRO_FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-3 text-sm text-foreground">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check size={12} className="text-primary" />
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <Button onClick={handleUpgrade} disabled={loading} className="w-full" size="lg">
          {loading ? "Opening checkout…" : "Upgrade — $5/month"}
        </Button>

        <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <Mail size={12} />
          <span>Feedback or questions?</span>
          <a href="mailto:synctuary0@gmail.com" className="text-primary hover:underline">synctuary0@gmail.com</a>
        </div>
        <p className="text-center text-[11px] text-muted-foreground/70">All sales are final. No refunds.</p>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Check, Mail, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

const PRO_FEATURES = [
  "Calendar use & Google Calendar import (.ics)",
  "See what friends are doing in Groups",
  "Customizable themes — fonts, palettes, sizes",
];

export default function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user, checkSubscription } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    setShowConfirm(true);
  };

  const confirmUpgrade = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Could not start checkout", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to restore purchases." });
      return;
    }
    setRestoring(true);
    try {
      await checkSubscription();
      toast({ title: "Restore Complete", description: "Your purchases have been checked successfully." });
    } catch {
      toast({ title: "Restore Failed", description: "Could not verify purchases.", variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <>
      <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Crown className="text-primary" size={24} />
                Synctuary Pro
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestore}
                disabled={restoring}
                className="text-xs gap-1 text-muted-foreground"
              >
                <RotateCcw size={12} />
                {restoring ? "Checking…" : "Restore"}
              </Button>
            </div>
            <DialogDescription>
              {feature
                ? `${feature} is a Pro feature. Upgrade to unlock it and more!`
                : "Unlock all premium features."}
            </DialogDescription>
          </DialogHeader>

          {/* Price */}
          <div className="text-center py-2">
            <span className="text-3xl font-extrabold text-foreground">$5</span>
            <span className="text-base text-muted-foreground font-medium">/year</span>
          </div>

          {/* Features */}
          <div className="space-y-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">What's included</p>
            {PRO_FEATURES.map((label) => (
              <div key={label} className="flex items-start gap-3 text-sm text-foreground">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check size={12} className="text-primary" />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <Button onClick={handleUpgrade} disabled={loading} className="w-full" size="lg">
            {loading ? "Opening checkout…" : "Subscribe — $5/year"}
          </Button>

          {/* Apple disclosures */}
          <div className="space-y-1.5 text-[10px] leading-relaxed text-muted-foreground/70 text-center">
            <p>Payment will be charged to your iTunes Account at confirmation of purchase.</p>
            <p>Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period.</p>
            <p>Account will be charged for renewal within 24 hours prior to the end of the current period at $5.00/year.</p>
            <p>Subscriptions may be managed by the user and auto-renewal may be turned off by going to Account Settings after purchase.</p>
          </div>

          {/* Legal links */}
          <div className="flex items-center justify-center gap-3 text-[11px]">
            <Link to="/privacy" className="text-primary hover:underline" onClick={() => onOpenChange(false)}>
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/terms" className="text-primary hover:underline" onClick={() => onOpenChange(false)}>
              Terms of Use (EULA)
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={12} />
            <span>Questions?</span>
            <a href="mailto:synctuary0@gmail.com" className="text-primary hover:underline">synctuary0@gmail.com</a>
          </div>
          <p className="text-center text-[11px] text-muted-foreground/70">All sales are final. No refunds.</p>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription>
              You're subscribing to Synctuary Pro at <strong>$5.00/month</strong>.
              Your subscription will auto-renew monthly until canceled.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={confirmUpgrade}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

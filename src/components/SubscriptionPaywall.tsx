import { useState } from "react";
import { Crown, Check, Mail, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const PRO_FEATURES = [
  "Calendar use & Google Calendar import (.ics)",
  "See what friends are doing in Groups",
  "Customizable themes — fonts, palettes, sizes",
];

export default function SubscriptionPaywall({
  feature,
  onClose,
}: {
  feature?: string;
  onClose?: () => void;
}) {
  const { user, checkSubscription } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setShowConfirm(true);
  };

  const confirmSubscribe = async () => {
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
      toast({ title: "Restore Failed", description: "Could not verify purchases. Please try again.", variant: "destructive" });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
      <div className="max-w-sm mx-auto w-full px-4 space-y-6">
        {/* Header with close & restore */}
        <div className="flex items-center justify-between">
          {onClose ? (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X size={20} />
            </Button>
          ) : (
            <div />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestore}
            disabled={restoring}
            className="text-xs gap-1.5 text-muted-foreground"
          >
            <RotateCcw size={14} />
            {restoring ? "Checking…" : "Restore Purchases"}
          </Button>
        </div>

        {/* Icon & title */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Crown size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Synctuary Pro</h2>
          {feature && (
            <p className="text-muted-foreground text-sm">
              <strong>{feature}</strong> is a Pro feature.
            </p>
          )}
        </div>

        {/* Price — large & clear */}
        <div className="text-center">
          <span className="text-4xl font-extrabold text-foreground">$5</span>
          <span className="text-lg text-muted-foreground font-medium">/year</span>
        </div>

        {/* Features */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            What's included
          </p>
          {PRO_FEATURES.map((label) => (
            <div key={label} className="flex items-start gap-3 text-sm text-foreground">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check size={12} className="text-primary" />
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Subscribe button */}
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          size="lg"
          className="w-full text-base"
        >
          {loading ? "Opening checkout…" : user ? "Subscribe — $5/month" : "Sign in to Subscribe"}
        </Button>

        {/* Apple-required subscription disclosures */}
        <div className="space-y-2 text-[11px] leading-relaxed text-muted-foreground/80 text-center">
          <p>
            Payment will be charged to your iTunes Account at confirmation of purchase.
          </p>
          <p>
            Subscription automatically renews unless auto-renew is turned off at least
            24 hours before the end of the current period.
          </p>
          <p>
            Account will be charged for renewal within 24 hours prior to the end of the
            current period at the cost of $5.00/month.
          </p>
          <p>
            Subscriptions may be managed by the user and auto-renewal may be turned off
            by going to the user's Account Settings after purchase.
          </p>
        </div>

        {/* Legal links */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Use (EULA)
          </Link>
        </div>

        {/* Contact & refund */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Mail size={12} />
            <span>Questions?</span>
            <a href="mailto:synctuary0@gmail.com" className="text-primary hover:underline">
              synctuary0@gmail.com
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground/70">All sales are final. No refunds.</p>
        </div>
      </div>

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
            <Button className="flex-1" onClick={confirmSubscribe}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

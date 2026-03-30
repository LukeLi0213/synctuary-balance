import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import UpgradeModal from "@/components/UpgradeModal";
import { Crown, Calendar, Users, Palette, Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProGateProps {
  feature: string;
  children: ReactNode;
}

const PRO_FEATURES = [
  { icon: Calendar, label: "Calendar use & incorporation of Google Calendar (.ics import)" },
  { icon: Users, label: "See what your friends are doing in the Group function" },
  { icon: Palette, label: "Customizable themes — fonts, color palettes, and font sizes" },
];

export default function ProGate({ feature, children }: ProGateProps) {
  const { isSubscribed, user } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  if (isSubscribed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
      <div className="max-w-sm mx-auto text-center space-y-6 px-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Crown size={32} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{feature} is a Pro Feature</h2>
        <p className="text-muted-foreground">
          Upgrade to Synctuary Pro for $5/month to unlock all premium features.
        </p>

        <div className="text-left space-y-2 bg-card border border-border rounded-2xl p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Synctuary Pro includes</p>
          {PRO_FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-3 text-sm text-foreground">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check size={12} className="text-primary" />
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {user ? (
          <Button onClick={() => setShowUpgrade(true)} size="lg" className="w-full">
            Upgrade to Pro — $5/month
          </Button>
        ) : (
          <Button onClick={() => navigate("/auth")} size="lg" className="w-full">
            Sign in to Upgrade
          </Button>
        )}

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Mail size={12} />
          <span>Feedback or questions?</span>
          <a href="mailto:synctuary0@gmail.com" className="text-primary hover:underline">synctuary0@gmail.com</a>
        </div>
        <p className="text-[11px] text-muted-foreground/70">All sales are final. No refunds.</p>

        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} feature={feature} />
      </div>
    </div>
  );
}

import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import UpgradeModal from "@/components/UpgradeModal";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProGateProps {
  feature: string;
  children: ReactNode;
}

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
          Upgrade to Synctuary Pro for $5/month to unlock {feature}, along with all other premium features.
        </p>
        {user ? (
          <Button onClick={() => setShowUpgrade(true)} size="lg" className="w-full">
            Upgrade to Pro
          </Button>
        ) : (
          <Button onClick={() => navigate("/auth")} size="lg" className="w-full">
            Sign in to Upgrade
          </Button>
        )}
        <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} feature={feature} />
      </div>
    </div>
  );
}

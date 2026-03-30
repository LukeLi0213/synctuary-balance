import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useSubscriptionGate() {
  const { isSubscribed } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [gatedFeature, setGatedFeature] = useState<string | undefined>();

  const requirePro = useCallback(
    (featureName: string): boolean => {
      if (isSubscribed) return true;
      setGatedFeature(featureName);
      setShowUpgrade(true);
      return false;
    },
    [isSubscribed]
  );

  return { isSubscribed, showUpgrade, setShowUpgrade, gatedFeature, requirePro };
}

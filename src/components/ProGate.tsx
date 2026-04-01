import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import SubscriptionPaywall from "@/components/SubscriptionPaywall";

interface ProGateProps {
  feature: string;
  children: ReactNode;
}

export default function ProGate({ feature, children }: ProGateProps) {
  const { isSubscribed } = useAuth();

  if (isSubscribed) return <>{children}</>;

  return <SubscriptionPaywall feature={feature} />;
}

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { usePreviewMode } from "@/hooks/usePreviewMode";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSubscribed: boolean;
  subscriptionEnd: string | null;
  subscriptionLoading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (!currentSession) {
      setIsSubscribed(false);
      setSubscriptionEnd(null);
      return;
    }
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setIsSubscribed(data?.subscribed ?? false);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (e) {
      console.error("[Synctuary] Subscription check failed:", e);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  useEffect(() => {
    let initialLoad = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => checkSubscription(), 0);
      } else {
        setIsSubscribed(false);
        setSubscriptionEnd(null);
      }
    });

    // Only set initial state if onAuthStateChange hasn't fired yet
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (initialLoad) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      initialLoad = false;
      subscription.unsubscribe();
    };
  }, [checkSubscription]);

  // Periodic refresh every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Dev-only preview overrides — simulate subscription / auth states without
  // touching real Supabase data. Guarded by usePreviewMode (which itself only
  // activates in dev/preview environments).
  const { mode: previewMode, isPreviewEnvironment } = usePreviewMode();

  let effectiveUser = user;
  let effectiveSession = session;
  let effectiveIsSubscribed = isSubscribed;

  if (isPreviewEnvironment && previewMode !== "off") {
    if (previewMode === "logged-out") {
      effectiveUser = null;
      effectiveSession = null;
      effectiveIsSubscribed = false;
    } else if (previewMode === "subscriber") {
      effectiveIsSubscribed = true;
    } else if (previewMode === "free") {
      effectiveIsSubscribed = false;
    }
  }

  return (
    <AuthContext.Provider value={{
      user: effectiveUser,
      session: effectiveSession,
      loading,
      isSubscribed: effectiveIsSubscribed,
      subscriptionEnd,
      subscriptionLoading,
      signUp,
      signIn,
      signOut,
      checkSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

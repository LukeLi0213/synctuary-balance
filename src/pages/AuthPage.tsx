import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password, displayName || email.split("@")[0]);
      if (error) setError(error.message);
      else setSignupSuccess(true);
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="glass-card-elevated p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-display font-bold mb-2 text-foreground">Check your email</h2>
          <p className="text-sm text-muted-foreground">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
          <button onClick={() => { setSignupSuccess(false); setMode("login"); }} className="mt-4 text-sm text-primary font-medium">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-8 max-w-sm w-full"
      >
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Synctuary" width={48} height={48} className="rounded-full mb-3" />
          <h1 className="text-2xl font-display font-bold text-foreground">Synctuary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            className="text-primary font-medium"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

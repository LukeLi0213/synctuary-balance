import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

type Phase = "work" | "rest";

const WORK_MINUTES = 20;
const REST_MINUTES = 5;

export default function PomodoroTimer() {
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_MINUTES * 60);
  const [running, setRunning] = useState(false);

  const totalSeconds = phase === "work" ? WORK_MINUTES * 60 : REST_MINUTES * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Auto-switch phase and keep running
          setPhase((p) => (p === "work" ? "rest" : "work"));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  // When phase changes, reset timer and auto-start
  useEffect(() => {
    setSecondsLeft(phase === "work" ? WORK_MINUTES * 60 : REST_MINUTES * 60);
    // Keep running when auto-transitioning (don't stop)
  }, [phase]);

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(phase === "work" ? WORK_MINUTES * 60 : REST_MINUTES * 60);
  }, [phase]);

  const circumference = 2 * Math.PI * 54;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        {phase === "work" ? (
          <Brain size={16} className="text-primary" />
        ) : (
          <Coffee size={16} className="text-accent" />
        )}
        <span className="text-sm font-medium">
          Pomodoro — {phase === "work" ? "Focus Time" : "Rest Break"}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6">
        {/* Circular progress */}
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="6"
            />
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke={phase === "work" ? "hsl(var(--primary))" : "hsl(var(--accent))"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              transition={{ duration: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-display text-foreground">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setRunning(!running)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              running
                ? "bg-muted text-foreground hover:bg-muted/80"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {running ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <button
            onClick={reset}
            className="w-12 h-12 rounded-xl bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Phase toggle */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => { setPhase("work"); setRunning(false); }}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
            phase === "work" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          Work · {WORK_MINUTES}m
        </button>
        <button
          onClick={() => { setPhase("rest"); setRunning(false); }}
          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
            phase === "rest" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          Rest · {REST_MINUTES}m
        </button>
      </div>
    </div>
  );
}

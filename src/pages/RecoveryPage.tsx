import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Check, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import WellbeingAvatar from "@/components/WellbeingAvatar";
import { AvatarMood } from "@/lib/store";

interface Props {
  avatarMood: AvatarMood;
  xp: number;
  level: number;
  onTakeBreak: () => void;
  onSkipBreak: () => void;
}

type Phase = "prompt" | "timer" | "report" | "done";

export default function RecoveryPage({ avatarMood, xp, level, onTakeBreak, onSkipBreak }: Props) {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [durationMinutes, setDurationMinutes] = useState(20);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [running, setRunning] = useState(false);
  const [reportAnswer, setReportAnswer] = useState<boolean | null>(null);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setRunning(false);
          setPhase("report");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setTimeLeft(durationMinutes * 60);
    setPhase("timer");
    setRunning(true);
  };

  const handleSkip = () => {
    onSkipBreak();
    setPhase("done");
  };

  const handleReport = (took: boolean) => {
    setReportAnswer(took);
    if (took) onTakeBreak();
    else onSkipBreak();
    setPhase("done");
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {phase === "prompt" && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card-elevated p-8 text-center w-full max-w-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-recovery/10 flex items-center justify-center mx-auto mb-5">
              <Shield size={32} className="text-recovery" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2">Recovery Time</h1>
            <p className="text-sm text-muted-foreground mb-1">
              You've completed focused work. Time to recharge.
            </p>
            <p className="text-sm font-medium text-primary mb-2">
              Take a {durationMinutes}-minute recovery break.
            </p>
            <div className="w-full px-2 mb-4">
              <Slider
                value={[durationMinutes]}
                onValueChange={([v]) => setDurationMinutes(v)}
                min={5}
                max={20}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>5 min</span>
                <span>20 min</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic mb-6">
              This is not a reward — it's protecting your performance.
            </p>
            <div className="space-y-2">
              <Button onClick={handleStart} className="w-full rounded-xl">
                Start Recovery Break
              </Button>
              <Button onClick={handleSkip} variant="ghost" className="w-full rounded-xl text-muted-foreground">
                Skip This Time
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "timer" && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center w-full max-w-sm"
          >
            <WellbeingAvatar mood="calm" xp={xp} level={level} />

            <div className="mt-8">
              <div className="text-6xl font-display font-bold tracking-tight text-primary mb-2">
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-muted-foreground mb-6">Recovery in progress...</p>

              {/* Progress ring */}
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-6">
                <motion.div
                  className="h-full bg-recovery rounded-full"
                  style={{ width: `${((durationMinutes * 60 - timeLeft) / (durationMinutes * 60)) * 100}%` }}
                />
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setRunning(!running)}
                >
                  {running ? <Pause size={18} /> : <Play size={18} />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => { setTimeLeft(durationMinutes * 60); setRunning(false); }}
                >
                  <RotateCcw size={18} />
                </Button>
                <Button
                  variant="ghost"
                  className="rounded-xl text-muted-foreground"
                  onClick={() => setPhase("report")}
                >
                  End Early
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {phase === "report" && (
          <motion.div
            key="report"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card-elevated p-8 text-center w-full max-w-sm"
          >
            <h2 className="font-display text-xl font-semibold mb-2">How did it go?</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Did you take your recovery break?
            </p>
            <div className="space-y-2">
              <Button onClick={() => handleReport(true)} className="w-full rounded-xl gap-2">
                <Check size={18} /> Yes, I rested
              </Button>
              <Button onClick={() => handleReport(false)} variant="outline" className="w-full rounded-xl gap-2">
                <X size={18} /> No, I skipped it
              </Button>
            </div>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center w-full max-w-sm"
          >
            <WellbeingAvatar mood={avatarMood} xp={xp} level={level} />
            <div className="mt-6 glass-card p-5">
              <p className="text-sm font-medium">
                {reportAnswer
                  ? "Recovery supports performance. Well done. 💚"
                  : "That's okay. Try to protect your next recovery break."}
              </p>
              <Button
                onClick={() => { setPhase("prompt"); setDurationMinutes(20); setTimeLeft(20 * 60); setReportAnswer(null); }}
                variant="outline"
                className="mt-4 rounded-xl"
              >
                Start Another Break
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface Props {
  open: boolean;
  onStart: (minutes: number) => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function RecoveryModal({ open, onStart, onSkip, onClose }: Props) {
  const [minutes, setMinutes] = useState(20);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card-elevated p-8 max-w-sm w-full text-center relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-recovery/10 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-recovery" />
            </div>

            <h2 className="font-display text-xl font-semibold mb-2">Time to Recharge</h2>
            <p className="text-sm text-muted-foreground mb-1">
              You've completed focused work. Your body and mind need recovery.
            </p>
            <p className="text-sm font-medium text-primary mb-4">
              Take a {minutes}-minute recovery break.
            </p>

            <div className="w-full px-2 mb-6">
              <Slider
                value={[minutes]}
                onValueChange={([v]) => setMinutes(v)}
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

            <div className="space-y-2">
              <Button onClick={() => onStart(minutes)} className="w-full rounded-xl">
                Start Recovery Break
              </Button>
              <Button onClick={onSkip} variant="ghost" className="w-full rounded-xl text-muted-foreground">
                Skip This Time
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

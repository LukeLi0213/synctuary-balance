import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Brain, Smile, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckInData } from "@/lib/store";

interface Props {
  onSubmit: (data: Omit<CheckInData, "date">) => void;
  alreadyDone: boolean;
}

const ratings = [1, 2, 3, 4, 5];

export default function DailyCheckIn({ onSubmit, alreadyDone }: Props) {
  const [sleep, setSleep] = useState(3);
  const [stress, setStress] = useState(3);
  const [mood, setMood] = useState(3);
  const [submitted, setSubmitted] = useState(alreadyDone);

  const handleSubmit = () => {
    onSubmit({ sleepQuality: sleep, stressLevel: stress, mood });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="glass-card p-4 text-center">
        <Check size={24} className="mx-auto text-primary mb-1" />
        <p className="text-sm text-muted-foreground">Today's check-in complete</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-elevated p-5"
    >
      <h3 className="font-display text-lg font-semibold mb-4">Daily Check-In</h3>

      <div className="space-y-4">
        <RatingRow icon={<Moon size={16} />} label="Sleep Quality" value={sleep} onChange={setSleep} />
        <RatingRow icon={<Brain size={16} />} label="Stress Level" value={stress} onChange={setStress} inverted />
        <RatingRow icon={<Smile size={16} />} label="Mood" value={mood} onChange={setMood} />
      </div>

      <Button onClick={handleSubmit} className="w-full mt-5 rounded-xl">
        Submit Check-In
      </Button>
    </motion.div>
  );
}

function RatingRow({
  icon,
  label,
  value,
  onChange,
  inverted,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
  inverted?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex gap-1.5">
        {ratings.map(r => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`flex-1 h-8 rounded-lg text-xs font-medium transition-all duration-200 ${
              r === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

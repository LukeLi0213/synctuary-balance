import { motion } from "framer-motion";
import avatarHappy from "@/assets/avatar-happy.png";
import avatarTired from "@/assets/avatar-tired.png";
import avatarCalm from "@/assets/avatar-calm.png";
import { AvatarMood, getAvatarMessage } from "@/lib/store";
import { useMemo } from "react";

const avatarImages: Record<AvatarMood, string> = {
  happy: avatarHappy,
  tired: avatarTired,
  calm: avatarCalm,
};

interface Props {
  mood: AvatarMood;
  xp: number;
  level: number;
  compact?: boolean;
}

export default function WellbeingAvatar({ mood, xp, level, compact }: Props) {
  const message = useMemo(() => getAvatarMessage(mood), [mood]);
  const nextLevelXP = [50, 150, 300, 500, 750][Math.min(level - 1, 4)];
  const prevLevelXP = level > 1 ? [0, 50, 150, 300, 500][Math.min(level - 1, 4)] : 0;
  const progress = ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <img src={avatarImages[mood]} alt="Avatar" className="w-12 h-12" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Lv.{level}</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="xp-bar h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-medium text-xp">{xp} XP</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <div className="avatar-glow rounded-full">
          <img src={avatarImages[mood]} alt="Wellbeing Avatar" className="w-32 h-32" />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        key={message}
        className="mt-4 text-sm text-muted-foreground italic max-w-[260px] leading-relaxed"
      >
        "{message}"
      </motion.p>

      <div className="mt-4 w-full max-w-[240px]">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium text-muted-foreground">Level {level}</span>
          <span className="font-medium text-xp">{xp} XP</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="xp-bar h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

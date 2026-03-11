import { motion } from "framer-motion";
import avatarHappy from "@/assets/avatar-happy.png";
import avatarTired from "@/assets/avatar-tired.png";
import avatarCalm from "@/assets/avatar-calm.png";
import itemScarf from "@/assets/item-scarf.png";
import { AvatarMood, AvatarItem, getAvatarMessage } from "@/lib/store";
import { useMemo } from "react";

const avatarImages: Record<AvatarMood, string> = {
  happy: avatarHappy,
  tired: avatarTired,
  calm: avatarCalm,
};

// Position each outfit item on the avatar body
const outfitPositions: Record<string, React.CSSProperties> = {
  scarf: { bottom: "15%", left: "50%", transform: "translateX(-50%)", fontSize: "1.75rem" },
  sunglasses: { top: "28%", left: "50%", transform: "translateX(-50%)", fontSize: "1.5rem" },
  crown: { top: "-8%", left: "50%", transform: "translateX(-50%)", fontSize: "2rem" },
};

interface Props {
  mood: AvatarMood;
  xp: number;
  level: number;
  compact?: boolean;
  equippedItems?: AvatarItem[];
}

export default function WellbeingAvatar({ mood, xp, level, compact, equippedItems = [] }: Props) {
  const message = useMemo(() => getAvatarMessage(mood), [mood]);
  const nextLevelXP = [50, 150, 300, 500, 750][Math.min(level - 1, 4)];
  const prevLevelXP = level > 1 ? [0, 50, 150, 300, 500][Math.min(level - 1, 4)] : 0;
  const progress = ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  const equippedOutfits = equippedItems.filter(i => i.type === "outfit");
  const equippedPets = equippedItems.filter(i => i.type === "pet");
  const equippedDecorations = equippedItems.filter(i => i.type === "decoration");

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={avatarImages[mood]} alt="Avatar" className="w-12 h-12" />
          {equippedItems.length > 0 && (
            <div className="absolute -bottom-1 -right-1 flex gap-0.5">
              {equippedItems.slice(0, 2).map(item => (
                <span key={item.id} className="text-xs">{item.icon}</span>
              ))}
            </div>
          )}
        </div>
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
        {/* Decorations - left side */}
        {equippedDecorations.length > 0 && (
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1">
            {equippedDecorations.map(item => (
              <motion.span
                key={item.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl"
              >
                {item.icon}
              </motion.span>
            ))}
          </div>
        )}

        <div className="avatar-glow rounded-full relative">
          <img src={avatarImages[mood]} alt="Wellbeing Avatar" className="w-32 h-32" />

          {/* Outfits rendered ON the avatar */}
          {equippedOutfits.map(item => {
            const pos = outfitPositions[item.id] ?? { top: "10%", left: "50%", transform: "translateX(-50%)", fontSize: "1.75rem" };
            return (
              <motion.span
                key={item.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute pointer-events-none drop-shadow-md"
                style={pos}
              >
                {item.icon}
              </motion.span>
            );
          })}
        </div>

        {/* Pets - right side */}
        {equippedPets.length > 0 && (
          <div className="absolute -right-8 bottom-0 flex flex-col gap-1">
            {equippedPets.map(item => (
              <motion.span
                key={item.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl"
                style={{ animationDelay: "0.2s" }}
              >
                {item.icon}
              </motion.span>
            ))}
          </div>
        )}
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

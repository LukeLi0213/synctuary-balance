import { motion } from "framer-motion";
import avatarHappy from "@/assets/avatar-happy.png";
import avatarTired from "@/assets/avatar-tired.png";
import avatarCalm from "@/assets/avatar-calm.png";
import avatarHappyScarf from "@/assets/avatar-happy-scarf.png";
import itemScarf from "@/assets/item-scarf.png";
import { AvatarMood, AvatarItem, getAvatarMessage } from "@/lib/store";
import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";

const avatarImages: Record<AvatarMood, string> = {
  happy: avatarHappy,
  tired: avatarTired,
  calm: avatarCalm,
};

// Image overlays for items that need real art instead of emojis
const outfitImages: Record<string, string> = {
  scarf: itemScarf,
};

const outfitPositions: Record<string, React.CSSProperties> = {
  scarf: { top: "30%", left: "46%", transform: "translate(-50%, 0)", width: "100%", zIndex: 10 },
  sunglasses: { top: "28%", left: "50%", transform: "translateX(-50%)", fontSize: "1.5rem" },
  crown: { top: "-8%", left: "50%", transform: "translateX(-50%)", fontSize: "2rem" },
};

interface Props {
  mood: AvatarMood;
  xp: number;
  level: number;
  compact?: boolean;
  equippedItems?: AvatarItem[];
  avatarName?: string;
  onNameChange?: (name: string) => void;
}

export default function WellbeingAvatar({ mood, xp, level, compact, equippedItems = [], avatarName, onNameChange }: Props) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(avatarName || "");
  const message = useMemo(() => getAvatarMessage(mood), [mood]);
  const nextLevelXP = [50, 150, 300, 500, 750][Math.min(level - 1, 4)];
  const prevLevelXP = level > 1 ? [0, 50, 150, 300, 500][Math.min(level - 1, 4)] : 0;
  const progress = ((xp - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  const hasScarf = equippedItems.some(i => i.id === "scarf");
  const currentAvatarImage = hasScarf ? avatarHappyScarf : avatarImages[mood];

  const equippedOutfits = equippedItems.filter(i => i.type === "outfit" && i.id !== "scarf");
  const equippedPets = equippedItems.filter(i => i.type === "pet");
  const equippedDecorations = equippedItems.filter(i => i.type === "decoration");

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={currentAvatarImage} alt="Avatar" className="w-12 h-12" />
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

  const handleNameSave = () => {
    if (onNameChange && nameInput.trim()) {
      onNameChange(nameInput.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="flex flex-col items-center text-center">
      {/* Avatar Name */}
      <div className="mb-2 flex items-center gap-1.5">
        {isEditingName ? (
          <input
            autoFocus
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={e => e.key === "Enter" && handleNameSave()}
            className="bg-transparent border-b border-primary text-center text-sm font-semibold outline-none w-32"
            maxLength={20}
            placeholder="Name your avatar"
          />
        ) : (
          <button
            onClick={() => { setNameInput(avatarName || ""); setIsEditingName(true); }}
            className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors group"
          >
            {avatarName || "Tap to name me!"}
            <Pencil size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        )}
      </div>
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
          <img src={currentAvatarImage} alt="Wellbeing Avatar" className="w-32 h-32" />

          {/* Outfits rendered ON the avatar */}
          {equippedOutfits.map(item => {
            const pos = outfitPositions[item.id] ?? { top: "10%", left: "50%", transform: "translateX(-50%)", fontSize: "1.75rem" };
            const imgSrc = outfitImages[item.id];
            return imgSrc ? (
              <motion.img
                key={item.id}
                src={imgSrc}
                alt={item.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute pointer-events-none"
                style={pos}
              />
            ) : (
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

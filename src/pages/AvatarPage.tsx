import { motion } from "framer-motion";
import { AvatarItem, AvatarMood } from "@/lib/store";
import WellbeingAvatar from "@/components/WellbeingAvatar";
import { Lock } from "lucide-react";

interface Props {
  inventory: AvatarItem[];
  avatarMood: AvatarMood;
  xp: number;
  level: number;
}

export default function AvatarPage({ inventory, avatarMood, xp, level }: Props) {
  const outfits = inventory.filter(i => i.type === "outfit");
  const pets = inventory.filter(i => i.type === "pet");
  const decorations = inventory.filter(i => i.type === "decoration");

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold mb-1">Your Avatar</h1>
      <p className="text-sm text-muted-foreground mb-6">Rewards for balanced living</p>

      {/* Avatar display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card-elevated p-6 mb-6"
      >
        <WellbeingAvatar mood={avatarMood} xp={xp} level={level} />
      </motion.div>

      {/* Inventory sections */}
      <InventorySection title="Outfits" items={outfits} xp={xp} />
      <InventorySection title="Companions" items={pets} xp={xp} />
      <InventorySection title="Decorations" items={decorations} xp={xp} />
    </div>
  );
}

function InventorySection({ title, items, xp }: { title: string; items: AvatarItem[]; xp: number }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{title}</p>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-3 text-center relative ${
              item.unlocked ? "" : "opacity-50"
            }`}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xs font-medium truncate">{item.name}</p>
            {!item.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/60 rounded-2xl">
                <div className="text-center">
                  <Lock size={14} className="mx-auto text-muted-foreground mb-0.5" />
                  <span className="text-[10px] text-muted-foreground">{item.xpRequired} XP</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

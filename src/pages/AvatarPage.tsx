import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarItem, AvatarMood } from "@/lib/store";
import WellbeingAvatar from "@/components/WellbeingAvatar";
import { Lock, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  inventory: AvatarItem[];
  avatarMood: AvatarMood;
  xp: number;
  level: number;
  onPurchase: (itemId: string) => void;
  onEquip: (itemId: string) => void;
}

export default function AvatarPage({ inventory, avatarMood, xp, level, onPurchase, onEquip }: Props) {
  const outfits = inventory.filter(i => i.type === "outfit");
  const pets = inventory.filter(i => i.type === "pet");
  const decorations = inventory.filter(i => i.type === "decoration");
  const equippedItems = inventory.filter(i => i.equipped);

  const handlePurchase = (item: AvatarItem) => {
    if (xp < item.xpRequired) {
      toast.error("Not enough XP to purchase this item.");
      return;
    }
    onPurchase(item.id);
    toast.success(`${item.name} purchased and equipped!`);
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold mb-1">Your Avatar</h1>
      <p className="text-sm text-muted-foreground mb-6">Rewards for balanced living</p>

      {/* Avatar display with equipped items */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card-elevated p-6 mb-6"
      >
        <WellbeingAvatar mood={avatarMood} xp={xp} level={level} equippedItems={equippedItems} />
      </motion.div>

      {/* Inventory sections */}
      <InventorySection title="Outfits" items={outfits} xp={xp} onPurchase={handlePurchase} onEquip={onEquip} />
      <InventorySection title="Companions" items={pets} xp={xp} onPurchase={handlePurchase} onEquip={onEquip} />
      <InventorySection title="Decorations" items={decorations} xp={xp} onPurchase={handlePurchase} onEquip={onEquip} />
    </div>
  );
}

function InventorySection({
  title,
  items,
  xp,
  onPurchase,
  onEquip,
}: {
  title: string;
  items: AvatarItem[];
  xp: number;
  onPurchase: (item: AvatarItem) => void;
  onEquip: (itemId: string) => void;
}) {
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
              item.equipped ? "ring-2 ring-primary" : ""
            }`}
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <p className="text-xs font-medium truncate mb-1.5">{item.name}</p>

            {/* Not unlocked yet */}
            {!item.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/70 rounded-2xl">
                <div className="text-center">
                  <Lock size={14} className="mx-auto text-muted-foreground mb-0.5" />
                  <span className="text-[10px] text-muted-foreground">{item.xpRequired} XP</span>
                </div>
              </div>
            )}

            {/* Unlocked but not owned — Buy button */}
            {item.unlocked && !item.owned && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-7 text-[10px] rounded-lg gap-1"
                onClick={() => onPurchase(item)}
              >
                <ShoppingBag size={10} /> {item.xpRequired} XP
              </Button>
            )}

            {/* Owned — Equip/Unequip toggle */}
            {item.owned && (
              <Button
                size="sm"
                variant={item.equipped ? "default" : "secondary"}
                className="w-full h-7 text-[10px] rounded-lg gap-1"
                onClick={() => onEquip(item.id)}
              >
                {item.equipped ? (
                  <><Check size={10} /> Equipped</>
                ) : (
                  "Equip"
                )}
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

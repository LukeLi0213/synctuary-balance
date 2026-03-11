import { Battery, BatteryLow, BatteryMedium, BatteryFull } from "lucide-react";

interface Props {
  balanceScore: number;
}

export default function EnergyIndicator({ balanceScore }: Props) {
  const level = balanceScore >= 70 ? "high" : balanceScore >= 40 ? "medium" : "low";
  const label = level === "high" ? "Balanced" : level === "medium" ? "Moderate" : "Low Energy";
  const Icon = level === "high" ? BatteryFull : level === "medium" ? BatteryMedium : BatteryLow;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Energy Balance</span>
        <Icon size={18} className={`text-energy-${level}`} />
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-display font-semibold">{balanceScore}%</span>
        <span className={`text-xs font-medium mb-1 text-energy-${level}`}>{label}</span>
      </div>
      <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 energy-gradient-${level}`}
          style={{ width: `${balanceScore}%` }}
        />
      </div>
    </div>
  );
}

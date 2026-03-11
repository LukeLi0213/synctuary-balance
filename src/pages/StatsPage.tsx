import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { WeeklyStats } from "@/lib/store";
import { CheckSquare, Timer, SkipForward, Scale } from "lucide-react";

interface Props {
  stats: WeeklyStats;
}

export default function StatsPage({ stats }: Props) {
  const weekData = [
    { day: "Mon", work: 4, recovery: 3 },
    { day: "Tue", work: 5, recovery: 2 },
    { day: "Wed", work: 3, recovery: 3 },
    { day: "Thu", work: 6, recovery: 1 },
    { day: "Fri", work: 4, recovery: 4 },
    { day: "Sat", work: 2, recovery: 3 },
    { day: "Sun", work: 1, recovery: 4 },
  ];

  const statCards = [
    { label: "Tasks Completed", value: stats.tasksCompleted, icon: CheckSquare, color: "text-primary" },
    { label: "Recovery Taken", value: stats.recoveryTaken, icon: Timer, color: "text-recovery" },
    { label: "Recovery Skipped", value: stats.recoverySkipped, icon: SkipForward, color: "text-destructive" },
    { label: "Balance Score", value: `${stats.balanceScore}%`, icon: Scale, color: "text-xp" },
  ];

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold mb-1">Weekly Summary</h1>
      <p className="text-sm text-muted-foreground mb-6">Your balance at a glance</p>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-4"
          >
            <Icon size={18} className={`${color} mb-2`} />
            <p className="text-2xl font-display font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card-elevated p-5"
      >
        <h3 className="font-display text-lg font-semibold mb-4">Work vs Recovery</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barGap={2}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis hide />
              <Bar dataKey="work" radius={[4, 4, 0, 0]} fill="hsl(145 30% 42%)" />
              <Bar dataKey="recovery" radius={[4, 4, 0, 0]} fill="hsl(220 50% 62%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 justify-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-xs text-muted-foreground">Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-recovery" />
            <span className="text-xs text-muted-foreground">Recovery</span>
          </div>
        </div>
      </motion.div>

      {/* Balance insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 mt-4"
      >
        <p className="text-sm font-medium mb-1">
          {stats.balanceScore >= 70
            ? "🌿 You're maintaining a healthy balance this week."
            : stats.balanceScore >= 40
            ? "⚡ Your balance could improve. Try protecting more recovery time."
            : "🔴 Your recovery is significantly below target. Prioritize rest."}
        </p>
        <p className="text-xs text-muted-foreground">
          Balance is measured by the ratio of recovery to work sessions.
        </p>
      </motion.div>
    </div>
  );
}

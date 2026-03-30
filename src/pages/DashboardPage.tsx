import { motion } from "framer-motion";
import WellbeingAvatar from "@/components/WellbeingAvatar";
import EnergyIndicator from "@/components/EnergyIndicator";
import DailyCheckIn from "@/components/DailyCheckIn";
import PomodoroTimer from "@/components/PomodoroTimer";
import { AppState, CheckInData } from "@/lib/store";
import { CheckSquare, Timer, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

interface Props {
  state: AppState;
  onCompleteTask: (id: string) => void;
  onCheckIn: (data: Omit<CheckInData, "date">) => void;
  onAvatarNameChange: (name: string) => void;
}

export default function DashboardPage({ state, onCompleteTask, onCheckIn, onAvatarNameChange }: Props) {
  const navigate = useNavigate();
  const todayTasks = state.tasks;
  const completedCount = todayTasks.filter(t => t.completed).length;
  const pendingRecovery = state.tasksCompletedSinceLastBreak >= 3;

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <img src={logo} alt="Synctuary logo" width={40} height={40} className="rounded-full" />
          <div>
            <h1 className="font-display text-2xl font-bold">Synctuary</h1>
            <p className="text-sm text-muted-foreground">Protect your balance</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p>
        </div>
      </motion.div>

      {/* Avatar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card-elevated p-6 mb-4"
      >
        <WellbeingAvatar mood={state.avatarMood} xp={state.xp} level={state.level} avatarName={state.avatarName} onNameChange={onAvatarNameChange} />
      </motion.div>

      {/* Energy Indicator */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <EnergyIndicator balanceScore={state.weeklyStats.balanceScore} />
      </motion.div>

      {/* Pomodoro Timer */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-4">
        <PomodoroTimer />
      </motion.div>

      {/* Recovery Alert */}
      {pendingRecovery && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate("/recovery")}
          className="w-full mt-4 glass-card p-4 flex items-center gap-3 border-recovery/30 bg-recovery/5 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-recovery/10 flex items-center justify-center">
            <Timer size={20} className="text-recovery" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Recovery break recommended</p>
            <p className="text-xs text-muted-foreground">You've completed {state.tasksCompletedSinceLastBreak} tasks. Time to recharge.</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </motion.button>
      )}

      {/* Today's Tasks Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4"
      >
        <button
          onClick={() => navigate("/tasks")}
          className="w-full glass-card p-4 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-primary" />
              <span className="text-sm font-medium">Today's Tasks</span>
            </div>
            <span className="text-xs text-muted-foreground">{completedCount}/{todayTasks.length} done</span>
          </div>
          <div className="space-y-2">
            {todayTasks.slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  task.completed ? "bg-primary border-primary" : "border-border"
                }`}>
                  {task.completed && <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />}
                </div>
                <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                  {task.title}
                </span>
              </div>
            ))}
            {todayTasks.length > 3 && (
              <p className="text-xs text-primary font-medium">+{todayTasks.length - 3} more →</p>
            )}
          </div>
        </button>
      </motion.div>

      {/* Daily Check-In */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4"
      >
        <DailyCheckIn onSubmit={onCheckIn} alreadyDone={!!state.todayCheckIn} />
      </motion.div>
    </div>
  );
}

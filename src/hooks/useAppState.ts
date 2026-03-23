import { useState, useCallback } from "react";
import { AppState, defaultState, getLevelFromXP, Task, CheckInData, AvatarMood } from "@/lib/store";
import { CalendarEvent } from "@/pages/CalendarPage";

export function useAppState() {
  const [state, setState] = useState<AppState>(defaultState);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const completeTask = useCallback((taskId: string) => {
    setState(prev => {
      const tasks = prev.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : undefined } : t
      );
      const justCompleted = !prev.tasks.find(t => t.id === taskId)?.completed;
      const sinceBreak = justCompleted ? prev.tasksCompletedSinceLastBreak + 1 : Math.max(0, prev.tasksCompletedSinceLastBreak - 1);
      const newXP = justCompleted ? prev.xp + 10 : Math.max(0, prev.xp - 10);
      const needsBreak = sinceBreak >= 3;
      
      let mood: AvatarMood = prev.avatarMood;
      if (sinceBreak >= 4) mood = "tired";
      else if (justCompleted) mood = "happy";

      return {
        ...prev,
        tasks,
        xp: newXP,
        level: getLevelFromXP(newXP),
        tasksCompletedSinceLastBreak: sinceBreak,
        recoveryBreaksPending: needsBreak ? prev.recoveryBreaksPending + 1 : prev.recoveryBreaksPending,
        avatarMood: mood,
        weeklyStats: {
          ...prev.weeklyStats,
          tasksCompleted: justCompleted ? prev.weeklyStats.tasksCompleted + 1 : prev.weeklyStats.tasksCompleted,
        },
        inventory: prev.inventory.map(item => ({
          ...item,
          unlocked: item.unlocked || newXP >= item.xpRequired,
        })),
      };
    });
  }, []);

  const addTask = useCallback((title: string, category: Task["category"]) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: Date.now().toString(), title, category, completed: false }],
    }));
  }, []);

  const submitCheckIn = useCallback((data: Omit<CheckInData, "date">) => {
    const checkIn: CheckInData = { ...data, date: new Date().toISOString().split("T")[0] };
    setState(prev => {
      const avgScore = (data.sleepQuality + (6 - data.stressLevel) + data.mood) / 3;
      const xpBonus = Math.round(avgScore * 5);
      const newXP = prev.xp + xpBonus;
      let mood: AvatarMood = "happy";
      if (data.sleepQuality <= 2 || data.stressLevel >= 4) mood = "tired";
      else if (data.mood >= 4) mood = "calm";

      return {
        ...prev,
        todayCheckIn: checkIn,
        xp: newXP,
        level: getLevelFromXP(newXP),
        avatarMood: mood,
        inventory: prev.inventory.map(item => ({
          ...item,
          unlocked: item.unlocked || newXP >= item.xpRequired,
        })),
      };
    });
  }, []);

  const takeRecoveryBreak = useCallback(() => {
    setState(prev => {
      const newXP = prev.xp + 15;
      return {
        ...prev,
        xp: newXP,
        level: getLevelFromXP(newXP),
        avatarMood: "calm",
        tasksCompletedSinceLastBreak: 0,
        recoveryBreaksPending: Math.max(0, prev.recoveryBreaksPending - 1),
        weeklyStats: {
          ...prev.weeklyStats,
          recoveryTaken: prev.weeklyStats.recoveryTaken + 1,
          balanceScore: Math.min(100, prev.weeklyStats.balanceScore + 3),
        },
        inventory: prev.inventory.map(item => ({
          ...item,
          unlocked: item.unlocked || newXP >= item.xpRequired,
        })),
      };
    });
  }, []);

  const skipRecoveryBreak = useCallback(() => {
    setState(prev => {
      const newXP = Math.max(0, prev.xp - 10);
      return {
        ...prev,
        xp: newXP,
        level: getLevelFromXP(newXP),
        avatarMood: "tired",
        recoveryBreaksPending: Math.max(0, prev.recoveryBreaksPending - 1),
        weeklyStats: {
          ...prev.weeklyStats,
          recoverySkipped: prev.weeklyStats.recoverySkipped + 1,
          balanceScore: Math.max(0, prev.weeklyStats.balanceScore - 5),
        },
      };
    });
  }, []);

  const purchaseItem = useCallback((itemId: string) => {
    setState(prev => {
      const item = prev.inventory.find(i => i.id === itemId);
      if (!item || item.owned || !item.unlocked) return prev;
      if (prev.xp < item.xpRequired) {
        console.log(`[Synctuary] Not enough XP to purchase ${item.name}. Need ${item.xpRequired}, have ${prev.xp}`);
        return prev;
      }
      const newXP = prev.xp - item.xpRequired;
      console.log(`[Synctuary] Purchased ${item.name} for ${item.xpRequired} XP. Remaining: ${newXP}`);
      return {
        ...prev,
        xp: newXP,
        level: getLevelFromXP(newXP),
        inventory: prev.inventory.map(i =>
          i.id === itemId ? { ...i, owned: true, equipped: true } : i
        ),
      };
    });
  }, []);

  const equipItem = useCallback((itemId: string) => {
    setState(prev => {
      const item = prev.inventory.find(i => i.id === itemId);
      if (!item || !item.owned) return prev;
      const newEquipped = !item.equipped;
      console.log(`[Synctuary] ${newEquipped ? "Equipped" : "Unequipped"} ${item.name}`);
      return {
        ...prev,
        inventory: prev.inventory.map(i =>
          i.id === itemId ? { ...i, equipped: newEquipped } : i
        ),
      };
    });
  }, []);

  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    setCalendarEvents(prev => [...prev, { ...event, id: `custom-${Date.now()}` }]);
  }, []);

  const addCalendarEvents = useCallback((events: Omit<CalendarEvent, "id">[]) => {
    const newEvents = events.map((e, i) => ({ ...e, id: `ics-${Date.now()}-${i}` }));
    setCalendarEvents(prev => [...prev, ...newEvents]);
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  return {
    state,
    calendarEvents,
    completeTask,
    addTask,
    submitCheckIn,
    takeRecoveryBreak,
    skipRecoveryBreak,
    purchaseItem,
    equipItem,
    addCalendarEvent,
    addCalendarEvents,
    deleteCalendarEvent,
  };
  };
}

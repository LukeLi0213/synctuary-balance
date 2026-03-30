import { useState, useCallback, useEffect, useRef } from "react";
import { AppState, defaultState, getLevelFromXP, Task, TaskFolder, CheckInData, AvatarMood } from "@/lib/store";
import { CalendarEvent } from "@/lib/calendarTypes";
import { supabase } from "@/integrations/supabase/client";

export function useAppState() {
  const [state, setState] = useState<AppState>(defaultState);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncToDb = useRef(async (newState: AppState) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const equippedIds = newState.inventory.filter(i => i.equipped).map(i => i.id);
    await supabase.from("profiles").update({
      xp: newState.xp,
      level: newState.level,
      avatar_mood: newState.avatarMood,
      tasks_completed: newState.weeklyStats.tasksCompleted,
      recovery_taken: newState.weeklyStats.recoveryTaken,
      balance_score: newState.weeklyStats.balanceScore,
      equipped_items: equippedIds,
    }).eq("id", session.user.id);
  });

  // Load profile from DB on mount if logged in
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (profile) {
        setState(prev => ({
          ...prev,
          xp: profile.xp,
          level: profile.level,
          avatarMood: (profile.avatar_mood as AvatarMood) || "happy",
          weeklyStats: {
            ...prev.weeklyStats,
            tasksCompleted: profile.tasks_completed,
            recoveryTaken: profile.recovery_taken,
            balanceScore: profile.balance_score,
          },
          inventory: prev.inventory.map(item => ({
            ...item,
            unlocked: item.unlocked || profile.xp >= item.xpRequired,
            equipped: profile.equipped_items?.includes(item.id) || false,
          })),
        }));
      }
    };
    loadProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) loadProfile();
    });
    return () => subscription.unsubscribe();
  }, []);

  const updateAndSync = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      if (syncTimeout.current) clearTimeout(syncTimeout.current);
      syncTimeout.current = setTimeout(() => syncToDb.current(next), 500);
      return next;
    });
  }, []);

  const completeTask = useCallback((taskId: string) => {
    updateAndSync(prev => {
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
  }, [updateAndSync]);

  const addTask = useCallback((title: string, category: Task["category"], folderId?: string) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: Date.now().toString(), title, category, completed: false, folderId }],
    }));
  }, []);

  const addFolder = useCallback((name: string, color: string) => {
    setState(prev => ({
      ...prev,
      folders: [...prev.folders, { id: `folder-${Date.now()}`, name, color }],
    }));
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    setState(prev => ({
      ...prev,
      folders: prev.folders.filter(f => f.id !== folderId),
      tasks: prev.tasks.map(t => t.folderId === folderId ? { ...t, folderId: undefined } : t),
    }));
  }, []);

  const toggleFolderCollapse = useCallback((folderId: string) => {
    setState(prev => ({
      ...prev,
      folders: prev.folders.map(f =>
        f.id === folderId ? { ...f, collapsed: !f.collapsed } : f
      ),
    }));
  }, []);

  const submitCheckIn = useCallback((data: Omit<CheckInData, "date">) => {
    updateAndSync(prev => {
      const checkIn: CheckInData = { ...data, date: new Date().toISOString().split("T")[0] };
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
  }, [updateAndSync]);

  const takeRecoveryBreak = useCallback(() => {
    updateAndSync(prev => {
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
  }, [updateAndSync]);

  const skipRecoveryBreak = useCallback(() => {
    updateAndSync(prev => {
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
  }, [updateAndSync]);

  const purchaseItem = useCallback((itemId: string) => {
    updateAndSync(prev => {
      const item = prev.inventory.find(i => i.id === itemId);
      if (!item || item.owned || !item.unlocked) return prev;
      if (prev.xp < item.xpRequired) return prev;
      const newXP = prev.xp - item.xpRequired;
      return {
        ...prev,
        xp: newXP,
        level: getLevelFromXP(newXP),
        inventory: prev.inventory.map(i =>
          i.id === itemId ? { ...i, owned: true, equipped: true } : i
        ),
      };
    });
  }, [updateAndSync]);

  const equipItem = useCallback((itemId: string) => {
    updateAndSync(prev => {
      const item = prev.inventory.find(i => i.id === itemId);
      if (!item || !item.owned) return prev;
      return {
        ...prev,
        inventory: prev.inventory.map(i =>
          i.id === itemId ? { ...i, equipped: !i.equipped } : i
        ),
      };
    });
  }, [updateAndSync]);

  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, "id">) => {
    setCalendarEvents(prev => [...prev, { ...event, id: `custom-${Date.now()}` }]);
  }, []);

  const addCalendarEvents = useCallback((events: Omit<CalendarEvent, "id">[]) => {
    const newEvents = events.map((e, i) => ({ ...e, id: `ics-${Date.now()}-${i}` }));
    setCalendarEvents(prev => [...prev, ...newEvents]);
  }, []);

  const updateCalendarEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setCalendarEvents(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const deleteCalendarEvent = useCallback((id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const toggleCalendarTaskComplete = useCallback((id: string) => {
    setCalendarEvents(prev =>
      prev.map(e =>
        e.id === id ? { ...e, completed: !e.completed } : e
      )
    );
  }, []);

  return {
    state,
    calendarEvents,
    completeTask,
    addTask,
    addFolder,
    deleteFolder,
    toggleFolderCollapse,
    submitCheckIn,
    takeRecoveryBreak,
    skipRecoveryBreak,
    purchaseItem,
    equipItem,
    addCalendarEvent,
    addCalendarEvents,
    updateCalendarEvent,
    deleteCalendarEvent,
    toggleCalendarTaskComplete,
  };
}

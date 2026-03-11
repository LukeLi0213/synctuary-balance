// Simple global state using React context
import { createContext, useContext } from "react";

export interface Task {
  id: string;
  title: string;
  category: "studying" | "assignment" | "lab" | "internship" | "sports" | "other";
  completed: boolean;
  completedAt?: Date;
}

export interface CheckInData {
  sleepQuality: number; // 1-5
  stressLevel: number; // 1-5
  mood: number; // 1-5
  date: string;
}

export interface WeeklyStats {
  tasksCompleted: number;
  recoveryTaken: number;
  recoverySkipped: number;
  balanceScore: number;
}

export interface AvatarItem {
  id: string;
  name: string;
  type: "outfit" | "pet" | "decoration";
  icon: string;
  xpRequired: number;
  unlocked: boolean;
  owned: boolean;
  equipped: boolean;
}

export type AvatarMood = "happy" | "tired" | "calm";

export interface AppState {
  xp: number;
  level: number;
  avatarMood: AvatarMood;
  tasks: Task[];
  todayCheckIn: CheckInData | null;
  weeklyStats: WeeklyStats;
  recoveryBreaksPending: number;
  tasksCompletedSinceLastBreak: number;
  inventory: AvatarItem[];
}

export const defaultInventory: AvatarItem[] = [
  { id: "scarf", name: "Cozy Scarf", type: "outfit", icon: "🧣", xpRequired: 0, unlocked: true, owned: true, equipped: false },
  { id: "sunglasses", name: "Cool Shades", type: "outfit", icon: "🕶️", xpRequired: 100, unlocked: false, owned: false, equipped: false },
  { id: "crown", name: "Balance Crown", type: "outfit", icon: "👑", xpRequired: 300, unlocked: false, owned: false, equipped: false },
  { id: "butterfly", name: "Companion Butterfly", type: "pet", icon: "🦋", xpRequired: 50, unlocked: false, owned: false, equipped: false },
  { id: "bunny", name: "Rest Bunny", type: "pet", icon: "🐰", xpRequired: 200, unlocked: false, owned: false, equipped: false },
  { id: "cat", name: "Study Cat", type: "pet", icon: "🐱", xpRequired: 400, unlocked: false, owned: false, equipped: false },
  { id: "plant", name: "Desk Plant", type: "decoration", icon: "🪴", xpRequired: 75, unlocked: true, owned: true, equipped: false },
  { id: "crystals", name: "Zen Crystals", type: "decoration", icon: "💎", xpRequired: 150, unlocked: false, owned: false, equipped: false },
  { id: "lantern", name: "Calm Lantern", type: "decoration", icon: "🏮", xpRequired: 250, unlocked: false, owned: false, equipped: false },
];

export const defaultState: AppState = {
  xp: 85,
  level: 2,
  avatarMood: "happy",
  tasks: [
    { id: "1", title: "Organic Chemistry Chapter 5", category: "studying", completed: false },
    { id: "2", title: "CS Problem Set #3", category: "assignment", completed: true, completedAt: new Date() },
    { id: "3", title: "Bio Lab Report", category: "lab", completed: false },
    { id: "4", title: "Resume for Summer Internship", category: "internship", completed: false },
    { id: "5", title: "Track Practice", category: "sports", completed: true, completedAt: new Date() },
  ],
  todayCheckIn: null,
  weeklyStats: {
    tasksCompleted: 18,
    recoveryTaken: 12,
    recoverySkipped: 3,
    balanceScore: 78,
  },
  recoveryBreaksPending: 0,
  tasksCompletedSinceLastBreak: 2,
  inventory: defaultInventory,
};

export const avatarMessages = {
  happy: [
    "You've done meaningful work today. Let's protect your recovery.",
    "Balance keeps us strong. You're doing great!",
    "Your energy is flowing well today. Keep it up!",
  ],
  tired: [
    "Rest helps you perform tomorrow. Take a break.",
    "You've been pushing hard. Your body needs recovery.",
    "Protect your energy. A short rest goes a long way.",
  ],
  calm: [
    "Recovery supports performance. Well done.",
    "Rest is not a reward — it's a requirement. You know this.",
    "Balance leads to long-term success. You're on the right path.",
  ],
};

export function getAvatarMessage(mood: AvatarMood): string {
  const messages = avatarMessages[mood];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getLevelFromXP(xp: number): number {
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 300) return 3;
  if (xp < 500) return 4;
  return 5;
}

export function getXPForNextLevel(level: number): number {
  const thresholds = [50, 150, 300, 500, 750];
  return thresholds[Math.min(level - 1, thresholds.length - 1)];
}

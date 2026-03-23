export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: "event" | "task" | "imported";
  color?: string;
  location?: string;
  description?: string;
  completed?: boolean;
  recurrence?: RecurrenceRule | null;
}

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "custom";
  interval?: number; // e.g. every 2 weeks
  daysOfWeek?: number[]; // 0=Sun..6=Sat for custom weekly
  endDate?: Date;
  count?: number; // max occurrences
}

export const EVENT_COLORS = [
  { name: "Sage", value: "hsl(145, 30%, 42%)" },
  { name: "Amber", value: "hsl(36, 80%, 56%)" },
  { name: "Sky", value: "hsl(200, 60%, 50%)" },
  { name: "Lavender", value: "hsl(270, 40%, 60%)" },
  { name: "Rose", value: "hsl(350, 55%, 55%)" },
  { name: "Teal", value: "hsl(175, 45%, 42%)" },
  { name: "Coral", value: "hsl(16, 70%, 58%)" },
  { name: "Slate", value: "hsl(215, 15%, 50%)" },
];

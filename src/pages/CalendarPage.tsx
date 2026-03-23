import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  CheckSquare,
  Shield,
  Clock,
  Upload,
  Info,
  FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Task } from "@/lib/store";
import { parseICSFile } from "@/lib/icsParser";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "task" | "recovery" | "custom" | "google";
  color?: string;
  time?: string;
}

interface Props {
  tasks: Task[];
  recoveryTaken: number;
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
  onAddEvents: (events: Omit<CalendarEvent, "id">[]) => void;
  onDeleteEvent: (id: string) => void;
}

type ViewMode = "week" | "month";

export default function CalendarPage({
  tasks,
  recoveryTaken,
  events,
  onAddEvent,
  onAddEvents,
  onDeleteEvent,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("12:00");
  const [showImportHelp, setShowImportHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combine tasks and custom events
  const allEvents = useMemo(() => {
    const taskEvents: CalendarEvent[] = tasks
      .filter((t) => t.completed && t.completedAt)
      .map((t) => ({
        id: `task-${t.id}`,
        title: t.title,
        date: new Date(t.completedAt!),
        type: "task" as const,
      }));

    return [...taskEvents, ...events];
  }, [tasks, events]);

  const days = useMemo(() => {
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      const monthDays = eachDayOfInterval({ start, end });
      // Pad start to Sunday
      const firstDay = start.getDay();
      const padStart = firstDay > 0
        ? eachDayOfInterval({
            start: startOfWeek(start, { weekStartsOn: 0 }),
            end: new Date(start.getTime() - 86400000),
          })
        : [];
      // Pad end to Saturday
      const lastDay = end.getDay();
      const padEnd = lastDay < 6
        ? eachDayOfInterval({
            start: new Date(end.getTime() + 86400000),
            end: endOfWeek(end, { weekStartsOn: 0 }),
          })
        : [];
      return [...padStart, ...monthDays, ...padEnd];
    }
  }, [currentDate, viewMode]);

  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "week") {
      setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    }
  };

  const getEventsForDay = (day: Date) =>
    allEvents.filter((e) => isSameDay(new Date(e.date), day));

  const handleAddEvent = () => {
    if (!newEventTitle.trim() || !selectedDate) return;
    onAddEvent({
      title: newEventTitle.trim(),
      date: selectedDate,
      type: "custom",
      time: newEventTime,
    });
    setNewEventTitle("");
    setShowAddEvent(false);
  };

  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  const headerLabel =
    viewMode === "week"
      ? `${format(days[0], "MMM d")} – ${format(days[6], "MMM d, yyyy")}`
      : format(currentDate, "MMMM yyyy");

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold">Calendar</h1>
          <div className="flex gap-1 bg-secondary rounded-xl p-0.5">
            {(["week", "month"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                  viewMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("prev")}>
            <ChevronLeft size={18} />
          </Button>
          <p className="text-sm font-medium">{headerLabel}</p>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("next")}>
            <ChevronRight size={18} />
          </Button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-3 mb-4"
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const selected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);
            const inMonth = viewMode === "month" ? isSameMonth(day, currentDate) : true;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`relative p-1.5 rounded-xl text-center transition-all min-h-[3rem] flex flex-col items-center ${
                  selected
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : today
                    ? "bg-primary/10 text-primary"
                    : inMonth
                    ? "hover:bg-secondary text-foreground"
                    : "text-muted-foreground/40"
                }`}
              >
                <span className={`text-xs font-medium ${today && !selected ? "font-bold" : ""}`}>
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          e.type === "task"
                            ? selected ? "bg-primary-foreground" : "bg-primary"
                            : e.type === "recovery"
                            ? "bg-recovery"
                            : e.type === "google"
                            ? "bg-blue-500"
                            : selected ? "bg-primary-foreground/70" : "bg-accent-foreground/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Day Detail */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card-elevated p-4 mb-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold">
                {isToday(selectedDate)
                  ? "Today"
                  : format(selectedDate, "EEEE, MMM d")}
              </h2>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-xl gap-1 text-xs"
                onClick={() => setShowAddEvent(!showAddEvent)}
              >
                <Plus size={14} /> Add Event
              </Button>
            </div>

            {/* Add event form */}
            <AnimatePresence>
              {showAddEvent && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-3"
                >
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Event name..."
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddEvent()}
                        className="rounded-xl text-sm"
                        autoFocus
                      />
                    </div>
                    <Input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="rounded-xl text-sm w-28"
                    />
                    <Button size="sm" className="rounded-xl" onClick={handleAddEvent}>
                      Add
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Events list */}
            {selectedDayEvents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No events for this day
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        event.type === "task"
                          ? "bg-primary/10 text-primary"
                          : event.type === "recovery"
                          ? "bg-recovery/10 text-recovery"
                          : event.type === "google"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {event.type === "task" ? (
                        <CheckSquare size={14} />
                      ) : event.type === "recovery" ? (
                        <Shield size={14} />
                      ) : (
                        <Clock size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      {event.time && (
                        <p className="text-[10px] text-muted-foreground">{event.time}</p>
                      )}
                    </div>
                    {event.type === "custom" && (
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                    {event.type === "google" && (
                      <span className="text-[10px] font-medium text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">
                        Google
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: "Tasks", color: "bg-primary" },
          { label: "Recovery", color: "bg-recovery" },
          { label: "Custom", color: "bg-accent-foreground/50" },
          { label: "Google", color: "bg-blue-500" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-[10px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, AlignLeft, Repeat, Clock, CheckSquare, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarEvent, RecurrenceRule, EVENT_COLORS } from "@/lib/calendarTypes";
import { format } from "date-fns";

interface Props {
  open: boolean;
  defaultStart: Date;
  defaultEnd: Date;
  defaultAllDay?: boolean;
  onSave: (event: Omit<CalendarEvent, "id">) => void;
  onClose: () => void;
}

export default function CalendarEventModal({
  open,
  defaultStart,
  defaultEnd,
  defaultAllDay = false,
  onSave,
  onClose,
}: Props) {
  const [itemType, setItemType] = useState<"event" | "task">("event");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(format(defaultStart, "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState(format(defaultStart, "HH:mm"));
  const [endDate, setEndDate] = useState(format(defaultEnd, "yyyy-MM-dd"));
  const [endTime, setEndTime] = useState(format(defaultEnd, "HH:mm"));
  const [allDay, setAllDay] = useState(defaultAllDay);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(EVENT_COLORS[0].value);
  const [recurrence, setRecurrence] = useState<RecurrenceRule["frequency"] | "none">("none");
  const [showMore, setShowMore] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;

    const start = allDay
      ? new Date(`${startDate}T00:00:00`)
      : new Date(`${startDate}T${startTime}:00`);
    const end = allDay
      ? new Date(`${endDate}T23:59:59`)
      : new Date(`${endDate}T${endTime}:00`);

    const rec: RecurrenceRule | null =
      recurrence !== "none"
        ? { frequency: recurrence as RecurrenceRule["frequency"] }
        : null;

    onSave({
      title: title.trim(),
      start,
      end,
      allDay,
      type: itemType,
      color,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
      completed: false,
      recurrence: rec,
    });

    // Reset
    setTitle("");
    setLocation("");
    setDescription("");
    setShowMore(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="glass-card-elevated p-5 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>

            {/* Type Toggle */}
            <div className="flex gap-1 bg-secondary rounded-xl p-0.5 mb-4 w-fit">
              <button
                onClick={() => setItemType("event")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  itemType === "event"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarDays size={13} /> Event
              </button>
              <button
                onClick={() => setItemType("task")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  itemType === "task"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckSquare size={13} /> Task
              </button>
            </div>

            {/* Title */}
            <Input
              placeholder={itemType === "event" ? "Add title" : "Add task"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="rounded-xl text-base font-medium border-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/60 mb-3"
              autoFocus
            />

            {/* Date/Time */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate < e.target.value) setEndDate(e.target.value);
                    }}
                    className="rounded-lg text-xs h-8 w-auto"
                  />
                  {!allDay && (
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="rounded-lg text-xs h-8 w-24"
                    />
                  )}
                  <span className="text-xs text-muted-foreground">to</span>
                  {!allDay && (
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="rounded-lg text-xs h-8 w-24"
                    />
                  )}
                  {allDay && (
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-lg text-xs h-8 w-auto"
                    />
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2 ml-6 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-muted-foreground">All day</span>
              </label>
            </div>

            {/* Color Picker */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex gap-1.5">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.value)}
                    className={`w-5 h-5 rounded-full transition-all ${
                      color === c.value
                        ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Recurrence */}
            <div className="flex items-center gap-2 mb-3">
              <Repeat size={14} className="text-muted-foreground flex-shrink-0" />
              <select
                value={recurrence}
                onChange={(e) =>
                  setRecurrence(e.target.value as RecurrenceRule["frequency"] | "none")
                }
                className="text-xs bg-secondary rounded-lg px-2 py-1.5 border-none outline-none text-foreground"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            {/* More Options Toggle */}
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-xs text-primary font-medium mb-3"
            >
              {showMore ? "Less options" : "More options"}
            </button>

            <AnimatePresence>
              {showMore && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2 mb-3"
                >
                  {itemType === "event" && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                      <Input
                        placeholder="Add location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="rounded-lg text-xs h-8"
                      />
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <AlignLeft size={14} className="text-muted-foreground flex-shrink-0 mt-2" />
                    <Textarea
                      placeholder="Add description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-lg text-xs min-h-[60px] resize-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" className="rounded-xl" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="rounded-xl"
                onClick={handleSave}
                disabled={!title.trim()}
              >
                Save
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

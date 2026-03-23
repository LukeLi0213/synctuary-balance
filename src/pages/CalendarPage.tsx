import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Info, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/store";
import { parseICSFile } from "@/lib/icsParser";
import { toast } from "sonner";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import type { EventInput, EventClickArg, DateSelectArg, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import { CalendarEvent, EVENT_COLORS } from "@/lib/calendarTypes";
import CalendarEventModal from "@/components/CalendarEventModal";

interface Props {
  tasks: Task[];
  recoveryTaken: number;
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
  onAddEvents: (events: Omit<CalendarEvent, "id">[]) => void;
  onUpdateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onToggleTaskComplete: (id: string) => void;
}

export default function CalendarPage({
  tasks,
  recoveryTaken,
  events,
  onAddEvent,
  onAddEvents,
  onUpdateEvent,
  onDeleteEvent,
  onToggleTaskComplete,
}: Props) {
  const [showImportHelp, setShowImportHelp] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStart, setModalStart] = useState(new Date());
  const [modalEnd, setModalEnd] = useState(new Date());
  const [modalAllDay, setModalAllDay] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const calendarRef = useRef<FullCalendar>(null);

  // Convert CalendarEvents to FullCalendar EventInput
  const fcEvents: EventInput[] = useMemo(() => {
    return events.map((e) => {
      const base: EventInput = {
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: e.allDay || false,
        backgroundColor: e.color || EVENT_COLORS[0].value,
        borderColor: e.color || EVENT_COLORS[0].value,
        textColor: "#fff",
        editable: e.type !== "imported",
        extendedProps: {
          type: e.type,
          location: e.location,
          description: e.description,
          completed: e.completed,
          recurrence: e.recurrence,
        },
        classNames: [
          e.type === "task" ? "fc-event-task" : "",
          e.completed ? "fc-event-completed" : "",
        ].filter(Boolean),
      };

      // Add rrule for recurring events
      if (e.recurrence) {
        const freqMap: Record<string, string> = {
          daily: "daily",
          weekly: "weekly",
          monthly: "monthly",
        };
        base.rrule = {
          freq: freqMap[e.recurrence.frequency] || "weekly",
          dtstart: e.start,
          count: e.recurrence.count || 52,
        };
        // Remove start/end when using rrule
        delete base.start;
        delete base.end;
        if (!e.allDay) {
          base.duration = {
            milliseconds: new Date(e.end).getTime() - new Date(e.start).getTime(),
          };
        }
      }

      return base;
    });
  }, [events]);

  // Also show Synctuary tasks on the calendar
  const taskEvents: EventInput[] = useMemo(() => {
    return tasks
      .filter((t) => t.completedAt)
      .map((t) => ({
        id: `synctask-${t.id}`,
        title: `✓ ${t.title}`,
        start: new Date(t.completedAt!),
        allDay: true,
        backgroundColor: "hsl(145, 30%, 42%)",
        borderColor: "hsl(145, 30%, 42%)",
        textColor: "#fff",
        editable: false,
        classNames: ["fc-event-synctask"],
      }));
  }, [tasks]);

  const allFcEvents = useMemo(
    () => [...fcEvents, ...taskEvents],
    [fcEvents, taskEvents]
  );

  // Handlers
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setModalStart(selectInfo.start);
    setModalEnd(selectInfo.end);
    setModalAllDay(selectInfo.allDay);
    setSelectedEvent(null);
    setModalOpen(true);
    // Unselect the selection
    const calApi = selectInfo.view.calendar;
    calApi.unselect();
  }, []);

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const id = clickInfo.event.id;
      // If it's a Synctuary task, ignore
      if (id.startsWith("synctask-")) return;

      const ev = events.find((e) => e.id === id);
      if (!ev) return;

      // If it's a task, toggle completion on click
      if (ev.type === "task") {
        onToggleTaskComplete(id);
        return;
      }

      setSelectedEvent(ev);
    },
    [events, onToggleTaskComplete]
  );

  const handleEventDrop = useCallback(
    (dropInfo: EventDropArg) => {
      const id = dropInfo.event.id;
      if (id.startsWith("synctask-")) {
        dropInfo.revert();
        return;
      }
      onUpdateEvent(id, {
        start: dropInfo.event.start!,
        end: dropInfo.event.end || dropInfo.event.start!,
        allDay: dropInfo.event.allDay,
      });
    },
    [onUpdateEvent]
  );

  const handleEventResize = useCallback(
    (resizeInfo: EventResizeDoneArg) => {
      const id = resizeInfo.event.id;
      onUpdateEvent(id, {
        start: resizeInfo.event.start!,
        end: resizeInfo.event.end || resizeInfo.event.start!,
      });
    },
    [onUpdateEvent]
  );

  const handleSaveEvent = useCallback(
    (event: Omit<CalendarEvent, "id">) => {
      onAddEvent(event);
      setModalOpen(false);
      setSelectedEvent(null);
    },
    [onAddEvent]
  );

  const handleICSUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".ics")) {
      toast.error("Please upload a .ics file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const parsed = parseICSFile(content);
      if (parsed.length === 0) {
        toast.error("No events found in the .ics file");
        return;
      }
      onAddEvents(parsed);
      toast.success(
        `Imported ${parsed.length} event${parsed.length > 1 ? "s" : ""}`
      );
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-4xl mx-auto">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".ics"
        onChange={handleICSUpload}
        className="hidden"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <h1 className="font-display text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl gap-1 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} /> Import .ics
          </Button>
        </div>
      </motion.div>

      {/* FullCalendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="fc-synctuary"
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
          selectable
          selectMirror
          editable
          dayMaxEvents={3}
          nowIndicator
          slotMinTime="06:00:00"
          slotMaxTime="24:00:00"
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          events={allFcEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          slotLabelFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
          eventContent={(arg) => {
            const props = arg.event.extendedProps;
            const isTask = props.type === "task";
            const isCompleted = props.completed;
            return (
              <div className="flex items-center gap-1 px-1 py-0.5 overflow-hidden w-full">
                {isTask && (
                  <span className="flex-shrink-0 text-[10px]">
                    {isCompleted ? "☑" : "☐"}
                  </span>
                )}
                <span
                  className={`text-[11px] font-medium truncate ${
                    isCompleted ? "line-through opacity-60" : ""
                  }`}
                >
                  {arg.timeText && (
                    <span className="font-normal opacity-80 mr-1">
                      {arg.timeText}
                    </span>
                  )}
                  {arg.event.title}
                </span>
              </div>
            );
          }}
        />
      </motion.div>

      {/* Import Instructions */}
      <div className="mt-4 mb-2">
        <button
          onClick={() => setShowImportHelp(!showImportHelp)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <Info size={12} />
          How to import from Google Calendar
        </button>
        <AnimatePresence>
          {showImportHelp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="glass-card p-4 mt-2 text-xs text-muted-foreground space-y-2">
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  <FileUp size={14} /> Import your Google Calendar events
                </p>
                <ol className="list-decimal list-inside space-y-1.5 ml-1">
                  <li>
                    Open{" "}
                    <span className="font-medium text-foreground">
                      Google Calendar
                    </span>{" "}
                    on your computer
                  </li>
                  <li>
                    Click the{" "}
                    <span className="font-medium text-foreground">
                      ⚙️ Settings
                    </span>{" "}
                    gear icon →{" "}
                    <span className="font-medium text-foreground">Settings</span>
                  </li>
                  <li>
                    In the left sidebar, click{" "}
                    <span className="font-medium text-foreground">
                      Import &amp; Export
                    </span>
                  </li>
                  <li>
                    Click{" "}
                    <span className="font-medium text-foreground">Export</span> —
                    this downloads a .zip file
                  </li>
                  <li>
                    Unzip the file to find your{" "}
                    <span className="font-medium text-foreground">.ics</span>{" "}
                    calendar files
                  </li>
                  <li>
                    Click{" "}
                    <span className="font-medium text-foreground">
                      "Import .ics"
                    </span>{" "}
                    above and select the .ics file
                  </li>
                </ol>
                <p className="text-[10px] italic pt-1 border-t border-border">
                  💡 Tip: You can also export a single calendar by going to its
                  settings and clicking "Export this calendar."
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event Detail Popover for selected event */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/10 backdrop-blur-sm p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card-elevated p-5 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-3 h-3 rounded-sm mt-1.5 flex-shrink-0"
                  style={{
                    backgroundColor:
                      selectedEvent.color || EVENT_COLORS[0].value,
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedEvent.allDay
                      ? "All day"
                      : `${new Date(selectedEvent.start).toLocaleTimeString(
                          [],
                          { hour: "numeric", minute: "2-digit" }
                        )} – ${new Date(selectedEvent.end).toLocaleTimeString(
                          [],
                          { hour: "numeric", minute: "2-digit" }
                        )}`}
                  </p>
                </div>
              </div>
              {selectedEvent.location && (
                <p className="text-xs text-muted-foreground mb-1">
                  📍 {selectedEvent.location}
                </p>
              )}
              {selectedEvent.description && (
                <p className="text-xs text-muted-foreground mb-3">
                  {selectedEvent.description}
                </p>
              )}
              {selectedEvent.recurrence && (
                <p className="text-[10px] text-primary font-medium mb-3">
                  🔁 Repeats {selectedEvent.recurrence.frequency}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => {
                    onDeleteEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creation Modal */}
      <CalendarEventModal
        open={modalOpen}
        defaultStart={modalStart}
        defaultEnd={modalEnd}
        defaultAllDay={modalAllDay}
        onSave={handleSaveEvent}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

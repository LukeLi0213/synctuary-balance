import { CalendarEvent } from "@/lib/calendarTypes";

/**
 * Parse an .ics file string into CalendarEvent objects.
 * Handles VEVENT blocks with SUMMARY, DTSTART, and DTEND fields.
 */
export function parseICSFile(icsContent: string): Omit<CalendarEvent, "id">[] {
  const events: Omit<CalendarEvent, "id">[] = [];
  const lines = unfoldLines(icsContent);

  let inEvent = false;
  let summary = "";
  let dtstart = "";
  let dtend = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "BEGIN:VEVENT") {
      inEvent = true;
      summary = "";
      dtstart = "";
      dtend = "";
    } else if (trimmed === "END:VEVENT") {
      if (inEvent && summary && dtstart) {
        const startDate = parseICSDate(dtstart);
        if (startDate) {
          const endDate = dtend ? parseICSDate(dtend) : startDate;
          const hasTime = dtstart.includes("T");
          events.push({
            title: summary,
            start: startDate,
            end: endDate || startDate,
            allDay: !hasTime,
            type: "imported",
            color: "hsl(200, 60%, 50%)",
            completed: false,
            recurrence: null,
          });
        }
      }
      inEvent = false;
    } else if (inEvent) {
      if (trimmed.startsWith("SUMMARY:") || trimmed.startsWith("SUMMARY;")) {
        summary = extractValue(trimmed);
      } else if (trimmed.startsWith("DTSTART")) {
        dtstart = extractValue(trimmed);
      } else if (trimmed.startsWith("DTEND")) {
        dtend = extractValue(trimmed);
      }
    }
  }

  return events;
}

/** Unfold continuation lines per RFC 5545 */
function unfoldLines(text: string): string[] {
  return text.replace(/\r\n /g, "").replace(/\r\n\t/g, "").split(/\r?\n/);
}

/** Extract value after the last colon */
function extractValue(line: string): string {
  const colonIdx = line.lastIndexOf(":");
  return colonIdx >= 0 ? line.substring(colonIdx + 1).trim() : line.trim();
}

/** Parse ICS date formats: 20240315T090000Z, 20240315T090000, 20240315 */
function parseICSDate(value: string): Date | null {
  try {
    const clean = value.replace("Z", "");
    if (clean.length === 8) {
      const year = parseInt(clean.substring(0, 4));
      const month = parseInt(clean.substring(4, 6)) - 1;
      const day = parseInt(clean.substring(6, 8));
      return new Date(year, month, day);
    } else if (clean.length >= 15) {
      const year = parseInt(clean.substring(0, 4));
      const month = parseInt(clean.substring(4, 6)) - 1;
      const day = parseInt(clean.substring(6, 8));
      const hour = parseInt(clean.substring(9, 11));
      const minute = parseInt(clean.substring(11, 13));
      return new Date(year, month, day, hour, minute);
    }
    return null;
  } catch {
    return null;
  }
}

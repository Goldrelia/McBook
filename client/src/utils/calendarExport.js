// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

/**
 * Build iCalendar (.ics) content for Google Calendar, Outlook, and other clients.
 * @see https://www.rfc-editor.org/rfc/rfc5545.html
 */

function escapeIcs(text) {
  if (text == null || text === "") return "";
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function foldLine(line) {
  const max = 75;
  if (line.length <= max) return line;
  const parts = [];
  let rest = line;
  while (rest.length > max) {
    parts.push(rest.slice(0, max));
    rest = ` ${rest.slice(max)}`;
  }
  if (rest) parts.push(rest);
  return parts.join("\r\n");
}

function parseDateTime(value) {
  if (value == null || value === "") return null;
  const normalized = String(value).trim().replace(" ", "T");
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Parse "22:01", "10:30 pm", "10:30pm" → { h, m } 24h, or null */
function parseClockPart(str) {
  const s = String(str).trim().toLowerCase().replace(/\./g, "");
  if (!s) return null;
  const ampm = s.includes("pm") ? "pm" : s.includes("am") ? "am" : null;
  const num = s.replace(/\s*(am|pm)\s*/i, "").trim();
  const m = num.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!m) return null;
  let h = Number(m[1], 10);
  const min = m[2] != null ? Number(m[2], 10) : 0;
  if (Number.isNaN(h) || Number.isNaN(min) || min < 0 || min > 59) return null;
  if (ampm === "pm" && h < 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;
  if (!ampm && h > 23) return null;
  if (h < 0 || h > 23) return null;
  return { h, m: min };
}

/**
 * Pending meeting request: derive local start/end from preferred date + time text.
 * If time range is invalid (end before start), uses 1 hour from start.
 */
function parseMeetingRequestWindow(appt) {
  const dateRaw = (appt.requestPreferredDate ?? "").trim();
  const timeRaw = (appt.requestPreferredTime ?? "").trim();
  if (!dateRaw) return null;

  const dateOnly = dateRaw.split("T")[0].trim();
  const dateTry = parseDateTime(`${dateOnly}T12:00:00`);
  if (!dateTry) return null;
  const y = dateTry.getFullYear();
  const mo = dateTry.getMonth();
  const day = dateTry.getDate();

  const splitRange = timeRaw.split(/\s*[-–—]\s*/).map((x) => x.trim()).filter(Boolean);
  const startClock = splitRange[0] ? parseClockPart(splitRange[0]) : null;
  const endClock = splitRange[1] ? parseClockPart(splitRange[1]) : null;

  const defaultStart = { h: 9, m: 0 };
  const sc = startClock || defaultStart;
  let start = new Date(y, mo, day, sc.h, sc.m, 0, 0);
  let end;
  if (endClock) {
    end = new Date(y, mo, day, endClock.h, endClock.m, 0, 0);
    if (end <= start) {
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }
  } else {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }
  return { start, end };
}

function formatUtcIcs(dt) {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dt.getUTCDate()).padStart(2, "0");
  const h = String(dt.getUTCHours()).padStart(2, "0");
  const min = String(dt.getUTCMinutes()).padStart(2, "0");
  const s = String(dt.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${day}T${h}${min}${s}Z`;
}

function buildVevent({ uid, summary, description, location, start, end }) {
  const dtstamp = formatUtcIcs(new Date());
  const dtstart = formatUtcIcs(start);
  const dtend = formatUtcIcs(end);
  const lines = [
    "BEGIN:VEVENT",
    foldLine(`UID:${escapeIcs(uid)}`),
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    foldLine(`SUMMARY:${escapeIcs(summary)}`),
  ];
  if (location) lines.push(foldLine(`LOCATION:${escapeIcs(location)}`));
  if (description) lines.push(foldLine(`DESCRIPTION:${escapeIcs(description)}`));
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

function buildCalendar(veventBlocks) {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//McBook//McBook Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ].join("\r\n");
  const footer = "END:VCALENDAR";
  return `${header}\r\n${veventBlocks.join("\r\n")}\r\n${footer}\r\n`;
}

export function downloadIcsFile(filename, icsBody) {
  const blob = new Blob([icsBody], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Student appointments: bookings use start_time/end_time; pending meeting requests use preferred date/time when confirmedOnly is false.
 * @param {{ confirmedOnly?: boolean }} [options] — if confirmedOnly, skip non-confirmed (pending requests, open group polls).
 */
export function buildStudentAppointmentsIcs(appointments, options = {}) {
  const { confirmedOnly = false } = options;
  const blocks = [];
  for (const appt of appointments || []) {
    if (appt.isGroupPoll) continue;

    if (appt.isRequestOnly) {
      if (confirmedOnly) continue;
      const win = parseMeetingRequestWindow(appt);
      if (!win) continue;
      const { start, end } = win;
      const uid = `mcbook-request-${String(appt.id).replace(/^req-/, "")}@mcbook`;
      const summary = `(Pending request) ${appt.title || "Meeting request"}`;
      const desc = ["Status: awaiting owner response", appt.owner_email && `Host: ${appt.owner_email}`]
        .filter(Boolean)
        .join("\n");
      blocks.push(
        buildVevent({
          uid,
          summary,
          description: desc,
          location: appt.location,
          start,
          end,
        }),
      );
      continue;
    }

    if (confirmedOnly && appt.status !== "confirmed") continue;
    const start = parseDateTime(appt.start_time);
    const end = parseDateTime(appt.end_time);
    if (!start || !end || end <= start) continue;
    const uid = `mcbook-booking-${appt.bookingIdForApi ?? appt.id}@mcbook`;
    const summary = appt.title || "McBook appointment";
    const desc = [appt.type && `Type: ${appt.type}`, appt.owner_email && `Host: ${appt.owner_email}`]
      .filter(Boolean)
      .join("\n");
    blocks.push(
      buildVevent({
        uid,
        summary,
        description: desc,
        location: appt.location,
        start,
        end,
      }),
    );
  }
  if (blocks.length === 0) return null;
  return buildCalendar(blocks);
}

/**
 * Owner slots: export concrete slot windows (optionally only slots with confirmed bookings).
 */
export function buildOwnerSlotsIcs(slots, { bookedOnly = false } = {}) {
  const blocks = [];
  for (const slot of slots || []) {
    if (bookedOnly && (!slot.bookings || slot.bookings.length === 0)) continue;
    const start = parseDateTime(slot.start_time);
    const end = parseDateTime(slot.end_time);
    if (!start || !end || end <= start) continue;
    const uid = `mcbook-slot-${slot.id}@mcbook`;
    const summary = slot.title || "McBook slot";
    const n = slot.bookings?.length || 0;
    const desc =
      n > 0
        ? `${String(slot.type || "slot")}\nConfirmed bookings: ${n}`
        : String(slot.type || "slot");
    blocks.push(
      buildVevent({
        uid,
        summary,
        description: desc,
        location: slot.location,
        start,
        end,
      }),
    );
  }
  if (blocks.length === 0) return null;
  return buildCalendar(blocks);
}

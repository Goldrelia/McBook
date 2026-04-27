// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

const pool = require("../config/db");
const crypto = require("crypto");

// Convert "9:00am" to "09:00:00"
function convertTo24Hour(time12h) {
  if (!time12h || (!time12h.includes("am") && !time12h.includes("pm"))) {
    return time12h;
  }

  const [time, modifier] = time12h.toLowerCase().split(/(am|pm)/);
  let [hours, minutes] = time.split(":").map((str) => str.trim());

  hours = parseInt(hours);
  minutes = minutes ? parseInt(minutes) : 0;

  if (modifier === "pm" && hours !== 12) {
    hours += 12;
  } else if (modifier === "am" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

function normalizeEmail(e) {
  return String(e || "")
    .trim()
    .toLowerCase();
}

const DAY_NAME_TO_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/** YYYY-MM-DD at local midnight; returns null if invalid */
function parseYmdLocal(ymd) {
  const m = String(ymd || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function formatYmdLocal(d) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Next calendar date (YYYY-MM-DD) matching weekday 0–6, preferring an optional season window. */
function firstConcreteDateForPollOption(weekdayIdx, seasonStartYmd, seasonEndYmd) {
  if (weekdayIdx == null || Number.isNaN(Number(weekdayIdx))) return null;
  const wd = Number(weekdayIdx);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let from = new Date(today.getTime());
  const seasonStart = seasonStartYmd ? parseYmdLocal(seasonStartYmd) : null;
  const seasonEnd = seasonEndYmd ? parseYmdLocal(seasonEndYmd) : null;
  if (seasonStart && seasonStart > from) from = new Date(seasonStart.getTime());
  const defaultUntil = new Date(today);
  defaultUntil.setDate(defaultUntil.getDate() + 370);
  const until = seasonEnd || defaultUntil;
  if (seasonEnd && seasonEnd < from) {
    for (let i = 0; i < 370; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() === wd) return formatYmdLocal(d);
    }
    return formatYmdLocal(today);
  }
  for (let cur = new Date(from.getTime()); cur.getTime() <= until.getTime(); cur.setDate(cur.getDate() + 1)) {
    if (cur.getDay() === wd) return formatYmdLocal(cur);
  }
  for (let i = 0; i < 370; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === wd) return formatYmdLocal(d);
  }
  return formatYmdLocal(today);
}

/** Sort: weekday-only template rows first, then legacy dated options. */
const ORDER_GROUP_OPTIONS = (alias = "") => {
  const p = alias ? `${alias}.` : "";
  return `(${p}option_date IS NOT NULL), COALESCE(${p}option_date, '1970-01-01'), ${p}weekday, ${p}start_time`;
};

function isGroupFinalized(row) {
  return Number(row?.group_finalized) === 1;
}

/** MySQL DATE (often a JS Date) or string -> YYYY-MM-DD in local calendar */
function formatSqlDatePart(val) {
  if (val == null) return "";
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = String(val);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  return s.slice(0, 10);
}

/** MySQL TIME or string -> HH:MM:SS */
function formatSqlTimePart(val) {
  if (val == null) return "00:00:00";
  const s = String(val);
  const m = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return "00:00:00";
  const h = String(Number(m[1])).padStart(2, "0");
  const min = String(m[2]).padStart(2, "0");
  const sec = String(m[3] != null ? Number(m[3]) : 0).padStart(2, "0");
  return `${h}:${min}:${sec}`;
}

/** Parse MySQL DATETIME string as local calendar (avoid UTC shift). */
function parseMysqlDatetimeLocal(dt) {
  const s = String(dt ?? "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2}):(\d{2})/);
  if (!m) return new Date(NaN);
  return new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6]),
    0,
  );
}

function formatMysqlDatetimeLocal(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "1970-01-01 00:00:00";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function recalcGroupOptionVoteCounts(slotId) {
  const [options] = await pool.execute(
    "SELECT id FROM group_slot_options WHERE slot_id = ?",
    [slotId],
  );
  for (const option of options) {
    const [counts] = await pool.execute(
      "SELECT COUNT(*) as count FROM availability_responses WHERE group_slot_option_id = ?",
      [option.id],
    );
    await pool.execute(
      "UPDATE group_slot_options SET vote_count = ? WHERE id = ?",
      [Number(counts[0].count), option.id],
    );
  }
}

async function syncGroupSlotPlaceholderTimes(slotId) {
  const [options] = await pool.execute(
    `SELECT o.option_date, o.weekday, o.start_time, o.end_time,
            s.group_season_start, s.group_season_end
     FROM group_slot_options o
     JOIN slots s ON s.id = o.slot_id
     WHERE o.slot_id = ?
     ORDER BY ${ORDER_GROUP_OPTIONS("o")}
     LIMIT 1`,
    [slotId],
  );
  if (options.length === 0) return;
  const o = options[0];
  let d = formatSqlDatePart(o.option_date);
  if (!d && o.weekday != null && o.weekday !== "") {
    d = firstConcreteDateForPollOption(
      Number(o.weekday),
      o.group_season_start ? formatSqlDatePart(o.group_season_start) : null,
      o.group_season_end ? formatSqlDatePart(o.group_season_end) : null,
    );
  }
  if (!d) return;
  const start = `${d} ${formatSqlTimePart(o.start_time)}`;
  const end = `${d} ${formatSqlTimePart(o.end_time)}`;
  await pool.execute(
    "UPDATE slots SET start_time = ?, end_time = ? WHERE id = ?",
    [start, end, slotId],
  );
}

/**
 * Add voting time options to a group meeting (before finalize)
 * POST /api/slots/:id/group-options
 * Body: { group_slot_options: [{ date, start_time, end_time }] } — legacy calendar rows
 *    or { group_poll_weekly_slots: [{ day, time_start, time_end }] } — one row per weekday+time choice
 */
async function addGroupSlotOptions(req, res) {
  const { id } = req.params;
  const { group_slot_options, group_poll_weekly_slots } = req.body;
  const owner_id = req.user.userId;

  let rowsToAdd = [];
  if (Array.isArray(group_poll_weekly_slots) && group_poll_weekly_slots.length > 0) {
    for (const ws of group_poll_weekly_slots) {
      const target = DAY_NAME_TO_INDEX[String(ws.day || "").trim()];
      if (target === undefined || !ws.time_start || !ws.time_end) {
        return res.status(400).json({
          error: "Each weekly option needs day (e.g. Monday), time_start, and time_end.",
        });
      }
      rowsToAdd.push({
        weekly: true,
        weekday: target,
        start_time: convertTo24Hour(ws.time_start),
        end_time: convertTo24Hour(ws.time_end),
      });
    }
  } else if (Array.isArray(group_slot_options) && group_slot_options.length > 0) {
    for (const option of group_slot_options) {
      if (!option.date || !option.start_time || !option.end_time) {
        return res.status(400).json({ error: "Each option needs date, start_time, end_time" });
      }
      rowsToAdd.push({
        weekly: false,
        date: option.date,
        start_time: convertTo24Hour(option.start_time),
        end_time: convertTo24Hour(option.end_time),
      });
    }
  } else {
    return res.status(400).json({
      error:
        "Send group_slot_options (calendar rows) or group_poll_weekly_slots (weekday + time rows).",
    });
  }

  try {
    const [slots] = await pool.execute(
      "SELECT * FROM slots WHERE id = ? AND owner_id = ?",
      [id, owner_id],
    );
    if (slots.length === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }
    const slot = slots[0];
    if (slot.type !== "group") {
      return res.status(400).json({ error: "Not a group meeting slot" });
    }
    if (isGroupFinalized(slot)) {
      return res.status(400).json({ error: "Cannot edit options after finalizing" });
    }

    for (const option of rowsToAdd) {
      const optionId = crypto.randomUUID();
      if (option.weekly) {
        await pool.execute(
          `INSERT INTO group_slot_options (id, slot_id, option_date, start_time, end_time, weekday)
           VALUES (?, ?, NULL, ?, ?, ?)`,
          [optionId, id, option.start_time, option.end_time, option.weekday],
        );
      } else {
        await pool.execute(
          `INSERT INTO group_slot_options (id, slot_id, option_date, start_time, end_time, weekday)
           VALUES (?, ?, ?, ?, ?, NULL)`,
          [optionId, id, option.date, option.start_time, option.end_time],
        );
      }
    }

    await recalcGroupOptionVoteCounts(id);
    await syncGroupSlotPlaceholderTimes(id);

    const [rows] = await pool.execute(
      `SELECT id, option_date, weekday, start_time, end_time, vote_count
       FROM group_slot_options WHERE slot_id = ? ORDER BY ${ORDER_GROUP_OPTIONS()}`,
      [id],
    );
    res.status(201).json({ options: rows });
  } catch (err) {
    console.error("Error adding group options:", err);
    res.status(500).json({ error: "Failed to add time options" });
  }
}

/**
 * Remove a voting time option (before finalize)
 * DELETE /api/slots/:id/group-options/:optionId
 */
async function deleteGroupSlotOption(req, res) {
  const { id, optionId } = req.params;
  const owner_id = req.user.userId;

  try {
    const [slots] = await pool.execute(
      "SELECT * FROM slots WHERE id = ? AND owner_id = ?",
      [id, owner_id],
    );
    if (slots.length === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }
    const slot = slots[0];
    if (slot.type !== "group") {
      return res.status(400).json({ error: "Not a group meeting slot" });
    }
    if (isGroupFinalized(slot)) {
      return res.status(400).json({ error: "Cannot edit options after finalizing" });
    }

    const [countRows] = await pool.execute(
      "SELECT COUNT(*) as c FROM group_slot_options WHERE slot_id = ?",
      [id],
    );
    if (Number(countRows[0].c) <= 1) {
      return res.status(400).json({
        error: "Keep at least one time option. Delete the whole meeting if needed.",
      });
    }

    const [opt] = await pool.execute(
      "SELECT id FROM group_slot_options WHERE id = ? AND slot_id = ?",
      [optionId, id],
    );
    if (opt.length === 0) {
      return res.status(404).json({ error: "Option not found" });
    }

    await pool.execute("DELETE FROM group_slot_options WHERE id = ?", [optionId]);
    await recalcGroupOptionVoteCounts(id);
    await syncGroupSlotPlaceholderTimes(id);

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting group option:", err);
    res.status(500).json({ error: "Failed to remove time option" });
  }
}

/**
 * Create a new slot
 * POST /api/slots
 */
async function createSlot(req, res) {
  const {
    title,
    type,
    status,
    start_time,
    end_time,
    is_recurring,
    recurrence_weeks,
    location,
    group_slot_options,
    weekly_slots,
    voter_emails,
    group_poll_weekly_slots,
    group_season_start,
    group_season_end,
  } = req.body;
  const owner_id = req.user.userId;

  // Validation
  const hasOfficeHoursBatch =
    type === "office_hours" &&
    Array.isArray(weekly_slots) &&
    weekly_slots.length > 0 &&
    is_recurring &&
    recurrence_weeks > 0;

  const hasGroupPollWeeklyBatch =
    type === "group" &&
    Array.isArray(group_poll_weekly_slots) &&
    group_poll_weekly_slots.length > 0;

  if (
    !type ||
    ((!start_time || !end_time) &&
      !hasOfficeHoursBatch &&
      !(type === "group" && (hasGroupPollWeeklyBatch || (Array.isArray(group_slot_options) && group_slot_options.length > 0))))
  ) {
    return res
      .status(400)
      .json({ error: "Missing required fields: type, start_time, end_time" });
  }

  if (!["request", "group", "office_hours"].includes(type)) {
    return res.status(400).json({
      error: "Invalid type. Must be: request, group, or office_hours",
    });
  }

  if (type === "group") {
    if (!Array.isArray(voter_emails) || voter_emails.length === 0) {
      return res.status(400).json({
        error:
          "Add at least one student email (who is allowed to vote). Invited students will see the poll in their dashboard.",
      });
    }
    const invited = [
      ...new Set(voter_emails.map((e) => normalizeEmail(e)).filter(Boolean)),
    ];
    if (invited.length === 0) {
      return res.status(400).json({ error: "Add at least one valid student email." });
    }
  }

  try {
    // Type 3: create one concrete slot for each weekly slot x week.
    if (
      type === "office_hours" &&
      Array.isArray(weekly_slots) &&
      weekly_slots.length > 0 &&
      is_recurring &&
      recurrence_weeks > 0
    ) {
      const dayMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const today = new Date();
      const createdIds = [];

      for (const weeklySlot of weekly_slots) {
        const targetDay = dayMap[weeklySlot.day];
        if (targetDay === undefined) continue;

        const [startHour, startMinute] = convertTo24Hour(weeklySlot.time_start)
          .split(":")
          .map(Number);
        const [endHour, endMinute] = convertTo24Hour(weeklySlot.time_end)
          .split(":")
          .map(Number);

        const currentDay = today.getDay();
        const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
        const firstDate = new Date(today);
        firstDate.setDate(today.getDate() + daysUntilTarget);

        for (let week = 0; week < recurrence_weeks; week++) {
          const slotDate = new Date(firstDate);
          slotDate.setDate(firstDate.getDate() + week * 7);

          const startDateTime = new Date(slotDate);
          startDateTime.setHours(startHour, startMinute, 0, 0);

          const endDateTime = new Date(slotDate);
          endDateTime.setHours(endHour, endMinute, 0, 0);

          const slotId = crypto.randomUUID();
          createdIds.push(slotId);

          await pool.execute(
            `INSERT INTO slots (id, owner_id, title, type, status, start_time, end_time, is_recurring, recurrence_weeks, invite_token, group_season_start, group_season_end, location)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)`,
            [
              slotId,
              owner_id,
              title,
              type,
              status || "active",
              startDateTime.toISOString().slice(0, 19).replace("T", " "),
              endDateTime.toISOString().slice(0, 19).replace("T", " "),
              1,
              recurrence_weeks,
              null,
              location || "TBD",
            ]
          );
        }
      }

      if (createdIds.length === 0) {
        return res.status(400).json({ error: "No valid weekly slots provided" });
      }

      const [rows] = await pool.execute(
        `SELECT * FROM slots WHERE id IN (${createdIds.map(() => "?").join(",")}) ORDER BY start_time ASC`,
        createdIds
      );

      return res.status(201).json({
        created_count: rows.length,
        slots: rows,
      });
    }

    const slotId = crypto.randomUUID();
    const invite_token =
      type === "group" ? crypto.randomBytes(16).toString("hex") : null;

    const groupInviteeList =
      type === "group" && Array.isArray(voter_emails)
        ? [...new Set(voter_emails.map((e) => normalizeEmail(e)).filter(Boolean))]
        : [];

    let slotStart = start_time;
    let slotEnd = end_time;
    let groupOptionsToInsert = null;

    let slotSeasonStart = null;
    let slotSeasonEnd = null;
    if (type === "group") {
      if (hasGroupPollWeeklyBatch) {
        if (group_season_start && group_season_end && group_season_start > group_season_end) {
          return res.status(400).json({ error: "Season end date must be on or after season start." });
        }
        slotSeasonStart = group_season_start || null;
        slotSeasonEnd = group_season_end || null;
        groupOptionsToInsert = [];
        for (const ws of group_poll_weekly_slots) {
          const target = DAY_NAME_TO_INDEX[String(ws.day || "").trim()];
          if (target === undefined || !ws.time_start || !ws.time_end) {
            return res.status(400).json({
              error: "Each poll choice needs a weekday (day) and time_start / time_end.",
            });
          }
          groupOptionsToInsert.push({
            weekly: true,
            weekday: target,
            start_time: convertTo24Hour(ws.time_start),
            end_time: convertTo24Hour(ws.time_end),
          });
        }
      } else if (Array.isArray(group_slot_options) && group_slot_options.length > 0) {
        groupOptionsToInsert = [];
        for (const option of group_slot_options) {
          if (!option.date || !option.start_time || !option.end_time) {
            return res.status(400).json({
              error: "Each group poll option needs date, start_time, end_time",
            });
          }
          groupOptionsToInsert.push({
            weekly: false,
            date: option.date,
            start_time: convertTo24Hour(option.start_time),
            end_time: convertTo24Hour(option.end_time),
          });
        }
      } else {
        return res.status(400).json({
          error:
            "Group meeting needs proposed times: add weekday + time choices for students to vote on, or send explicit calendar options.",
        });
      }
      const first = groupOptionsToInsert[0];
      let anchorDate;
      if (first.weekly) {
        anchorDate = firstConcreteDateForPollOption(
          first.weekday,
          slotSeasonStart,
          slotSeasonEnd,
        );
      } else {
        anchorDate = first.date;
      }
      slotStart = `${anchorDate} ${first.start_time}`;
      slotEnd = `${anchorDate} ${first.end_time}`;
    }

    await pool.execute(
      `INSERT INTO slots (id, owner_id, title, type, status, start_time, end_time, is_recurring, recurrence_weeks, invite_token, group_season_start, group_season_end, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slotId,
        owner_id,
        title,
        type,
        type === "group" ? "private" : status || "private",
        slotStart,
        slotEnd,
        is_recurring ? 1 : 0,
        recurrence_weeks,
        invite_token,
        type === "group" ? slotSeasonStart : null,
        type === "group" ? slotSeasonEnd : null,
        location || "TBD",
      ],
    );

    if (type === "group" && groupOptionsToInsert && groupOptionsToInsert.length > 0) {
      for (const option of groupOptionsToInsert) {
        const optionId = crypto.randomUUID();
        if (option.weekly) {
          await pool.execute(
            `INSERT INTO group_slot_options (id, slot_id, option_date, start_time, end_time, weekday)
             VALUES (?, ?, NULL, ?, ?, ?)`,
            [optionId, slotId, option.start_time, option.end_time, option.weekday],
          );
        } else {
          await pool.execute(
            `INSERT INTO group_slot_options (id, slot_id, option_date, start_time, end_time, weekday)
             VALUES (?, ?, ?, ?, ?, NULL)`,
            [optionId, slotId, option.date, option.start_time, option.end_time],
          );
        }
      }
    }

    if (type === "group" && groupInviteeList.length) {
      for (const email of groupInviteeList) {
        const invId = crypto.randomUUID();
        await pool.execute(
          `INSERT INTO group_meeting_invitees (id, slot_id, email) VALUES (?, ?, ?)`,
          [invId, slotId, email],
        );
      }
    }

    const [rows] = await pool.execute("SELECT * FROM slots WHERE id = ?", [
      slotId,
    ]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating slot:", err);
    res.status(500).json({ error: "Failed to create slot" });
  }
}

/**
 * Get all slots for the owner
 * GET /api/slots
 */
async function getOwnerSlots(req, res) {
  const owner_id = req.user.userId;

  try {
    const [slots] = await pool.execute(
      `SELECT s.*, 
       GROUP_CONCAT(DISTINCT CONCAT(b.id, ':', u.email, ':', COALESCE(b.status, 'confirmed')) SEPARATOR '||') as booking_data
       FROM slots s
       LEFT JOIN bookings b ON s.id = b.slot_id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE s.owner_id = ?
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [owner_id],
    );

    // Process each slot
    const processedSlots = await Promise.all(
      slots.map(async (slot) => {
        // Parse bookings
        slot.bookings = slot.booking_data
          ? slot.booking_data.split("||").map((b) => {
              const [id, email, status] = b.split(":");
              return {
                id,
                email,
                status,
                user: email.split("@")[0].replace(".", " "),
              };
            })
          : [];
        delete slot.booking_data;

        // If it's a group meeting, fetch the voting options AND count unique voters
        if (slot.type === "group") {
          const [options] = await pool.execute(
            `SELECT id, option_date, weekday, start_time, end_time, vote_count
     FROM group_slot_options
     WHERE slot_id = ?
     ORDER BY ${ORDER_GROUP_OPTIONS()}`,
            [slot.id],
          );
          slot.group_slot_options = options;

          // Count unique voters for this slot
          const [voterCount] = await pool.execute(
            `SELECT COUNT(DISTINCT user_id) as voter_count
     FROM availability_responses
     WHERE slot_id = ?`,
            [slot.id],
          );
          slot.voter_count = voterCount[0].voter_count;

          const [inv] = await pool.execute(
            `SELECT email FROM group_meeting_invitees WHERE slot_id = ? ORDER BY email`,
            [slot.id],
          );
          slot.group_invite_emails = (inv || []).map((r) => r.email);
        }

        return slot;
      }),
    );

    res.json(processedSlots);
  } catch (err) {
    console.error("Error fetching owner slots:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
}

/**
 * List group meeting polls the student is invited to (not finalized, vote phase)
 * GET /api/student/group-polls
 */
async function getStudentGroupPolls(req, res) {
  const user_id = req.user.userId;

  try {
    const [me] = await pool.execute("SELECT email FROM users WHERE id = ?", [
      user_id,
    ]);
    if (me.length === 0) {
      return res.json([]);
    }
    const email = normalizeEmail(me[0].email);
    const [rows] = await pool.execute(
      `SELECT s.id, s.title, s.type, s.status, s.start_time, s.end_time, s.location,
              s.invite_token, s.group_finalized, u.email AS owner_email,
              (SELECT COUNT(DISTINCT ar.id) FROM availability_responses ar
                 WHERE ar.slot_id = s.id AND ar.user_id = ?) AS response_count
       FROM group_meeting_invitees g
       JOIN slots s ON s.id = g.slot_id
       JOIN users u ON s.owner_id = u.id
       WHERE g.email = ? AND s.type = 'group' AND s.group_finalized = 0`,
      [user_id, email],
    );

    res.json(
      (rows || []).map((r) => ({
        ...r,
        has_voted: Number(r.response_count) > 0,
        group_finalized: Boolean(r.group_finalized),
      })),
    );
  } catch (err) {
    console.error("Error fetching group polls for student:", err);
    res.status(500).json({ error: "Failed to load group meeting polls" });
  }
}

/**
 * Get a specific slot by ID
 * GET /api/slots/:id
 */
async function getSlotById(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute("SELECT * FROM slots WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }

    const [bookings] = await pool.execute(
      `SELECT b.*, u.email 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       WHERE b.slot_id = ? AND b.status = 'confirmed'`,
      [id],
    );

    const slot = rows[0];
    slot.bookings = bookings;

    // If group meeting, fetch options
    if (slot.type === "group") {
      const [options] = await pool.execute(
        `SELECT * FROM group_slot_options WHERE slot_id = ? ORDER BY ${ORDER_GROUP_OPTIONS()}`,
        [id],
      );
      slot.group_slot_options = options;
    }

    res.json(slot);
  } catch (err) {
    console.error("Error fetching slot:", err);
    res.status(500).json({ error: "Failed to fetch slot" });
  }
}

/**
 * Get voting options for a group slot
 * GET /api/slots/:id/options
 */
async function getSlotOptions(req, res) {
  const { id } = req.params;

  try {
    const [options] = await pool.execute(
      `SELECT * FROM group_slot_options WHERE slot_id = ? ORDER BY ${ORDER_GROUP_OPTIONS()}`,
      [id],
    );

    res.json(options);
  } catch (err) {
    console.error("Error fetching slot options:", err);
    res.status(500).json({ error: "Failed to fetch options" });
  }
}

/**
 * Update a slot
 * PATCH /api/slots/:id
 */
async function updateSlot(req, res) {
  const { id } = req.params;
  const owner_id = req.user.userId;
  const { title, status, start_time, end_time } = req.body;

  try {
    const [slots] = await pool.execute(
      "SELECT * FROM slots WHERE id = ? AND owner_id = ?",
      [id, owner_id],
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: "Slot not found or unauthorized" });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }
    if (start_time !== undefined) {
      updates.push("start_time = ?");
      values.push(start_time);
    }
    if (end_time !== undefined) {
      updates.push("end_time = ?");
      values.push(end_time);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);

    await pool.execute(
      `UPDATE slots SET ${updates.join(", ")} WHERE id = ?`,
      values,
    );

    const [updated] = await pool.execute("SELECT * FROM slots WHERE id = ?", [
      id,
    ]);
    res.json(updated[0]);
  } catch (err) {
    console.error("Error updating slot:", err);
    res.status(500).json({ error: "Failed to update slot" });
  }
}

/**
 * Delete a slot
 * DELETE /api/slots/:id
 */
async function deleteSlot(req, res) {
  const { id } = req.params;
  const owner_id = req.user.userId;

  try {
    const [slots] = await pool.execute(
      "SELECT * FROM slots WHERE id = ? AND owner_id = ?",
      [id, owner_id],
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: "Slot not found or unauthorized" });
    }

    const [bookings] = await pool.execute(
      `SELECT b.*, u.email, u.id as user_id
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.slot_id = ?`,
      [id],
    );

    for (let booking of bookings) {
      await pool.execute(
        `INSERT INTO notifications (user_id, type, message)
         VALUES (?, 'slot_deleted', ?)`,
        [
          booking.user_id,
          `Your booking "${slots[0].title}" has been cancelled by the owner.`,
        ],
      );
    }

    await pool.execute("DELETE FROM slots WHERE id = ?", [id]);

    res.json({
      message: "Slot deleted successfully",
      affected_users: bookings.length,
    });
  } catch (err) {
    console.error("Error deleting slot:", err);
    res.status(500).json({ error: "Failed to delete slot" });
  }
}

/**
 * Delete an entire recurring series based on a slot instance
 * DELETE /api/slots/:id/series
 */
async function deleteRecurringSeries(req, res) {
  const { id } = req.params;
  const owner_id = req.user.userId;

  try {
    const [slots] = await pool.execute(
      "SELECT * FROM slots WHERE id = ? AND owner_id = ?",
      [id, owner_id]
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: "Slot not found or unauthorized" });
    }

    const seed = slots[0];
    if (!seed.is_recurring) {
      return res.status(400).json({ error: "Slot is not recurring" });
    }

    const [seriesSlots] = await pool.execute(
      `SELECT id
       FROM slots
       WHERE owner_id = ?
         AND is_recurring = 1
         AND type = ?
         AND title = ?
         AND location = ?
         AND recurrence_weeks = ?
         AND DAYOFWEEK(start_time) = DAYOFWEEK(?)
         AND TIME(start_time) = TIME(?)
         AND TIME(end_time) = TIME(?)`,
      [
        owner_id,
        seed.type,
        seed.title,
        seed.location,
        seed.recurrence_weeks,
        seed.start_time,
        seed.start_time,
        seed.end_time,
      ]
    );

    if (seriesSlots.length === 0) {
      return res.status(404).json({ error: "No recurring series found" });
    }

    const slotIds = seriesSlots.map((s) => s.id);
    const placeholders = slotIds.map(() => "?").join(",");

    const [bookings] = await pool.execute(
      `SELECT DISTINCT b.user_id
       FROM bookings b
       WHERE b.slot_id IN (${placeholders})`,
      slotIds
    );

    for (const booking of bookings) {
      await pool.execute(
        `INSERT INTO notifications (user_id, type, message)
         VALUES (?, 'slot_deleted', ?)`,
        [booking.user_id, `Your recurring booking series "${seed.title}" has been cancelled by the owner.`]
      );
    }

    await pool.execute(
      `DELETE FROM slots WHERE id IN (${placeholders})`,
      slotIds
    );

    res.json({
      message: "Recurring series deleted successfully",
      deleted_count: slotIds.length,
    });
  } catch (err) {
    console.error("Error deleting recurring series:", err);
    res.status(500).json({ error: "Failed to delete recurring series" });
  }
}

/**
 * Get all active slots (for student browsing)
 * GET /api/slots/browse
 */
async function browseSlots(req, res) {
  try {
    const [slots] = await pool.execute(
      `SELECT s.*, u.email as owner_email 
       FROM slots s 
       JOIN users u ON s.owner_id = u.id 
       WHERE s.status = 'active'
         AND s.type != 'group'
         AND NOT EXISTS (
           SELECT 1
           FROM bookings b
           WHERE b.slot_id = s.id
             AND b.status = 'confirmed'
         )
       ORDER BY s.start_time ASC`,
    );

    for (let slot of slots) {
      const [bookings] = await pool.execute(
        'SELECT COUNT(*) as count FROM bookings WHERE slot_id = ? AND status = "confirmed"',
        [slot.id],
      );
      slot.booking_count = bookings[0].count;
    }

    res.json(slots);
  } catch (err) {
    console.error("Error browsing slots:", err);
    res.status(500).json({ error: "Failed to browse slots" });
  }
}

/**
 * Get slot by invite token (for group meetings)
 * GET /api/invite/:token
 * Optional auth: if invitee list is set, only listed users may open the poll.
 */
async function getSlotByInvite(req, res) {
  const { token } = req.params;
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, u.email as owner_email
       FROM slots s
       JOIN users u ON s.owner_id = u.id
       WHERE s.invite_token = ?`,
      [token],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Invalid invite link" });
    }

    const slot = rows[0];
    let restricts_to_invitees = false;
    let is_invited = true;

    if (slot.type === "group") {
      const [invRows] = await pool.execute(
        "SELECT email FROM group_meeting_invitees WHERE slot_id = ?",
        [slot.id],
      );
      restricts_to_invitees = invRows.length > 0;
      if (restricts_to_invitees) {
        if (!req.user?.email) {
          return res.status(401).json({
            error: "Log in to access this group poll",
            need_login: true,
          });
        }
        is_invited = invRows.some(
          (r) => String(r.email).toLowerCase() === req.user.email,
        );
        if (!is_invited) {
          return res.status(403).json({
            error: "You are not on the invited list for this meeting.",
          });
        }
      }

      const [options] = await pool.execute(
        `SELECT id, option_date, weekday, start_time, end_time, vote_count
         FROM group_slot_options
         WHERE slot_id = ?
         ORDER BY ${ORDER_GROUP_OPTIONS()}`,
        [slot.id],
      );
      slot.group_slot_options = options;
    }

    slot.group_finalized = Boolean(slot.group_finalized);
    slot.restricts_to_invitees = restricts_to_invitees;
    slot.is_invited = is_invited;
    slot.can_vote =
      !slot.group_finalized && is_invited && slot.type === "group";

    res.json(slot);
  } catch (err) {
    console.error("Error fetching slot by invite:", err);
    res.status(500).json({ error: "Failed to fetch slot" });
  }
}

/**
 * Finalize a group meeting slot
 * POST /api/slots/:id/finalize
 * Body: { selected_option_id, is_recurring, recurrence_weeks }
 */
async function finalizeGroupSlot(req, res) {
  const { id } = req.params;
  const { selected_option_id, is_recurring, recurrence_weeks } = req.body;
  const owner_id = req.user.userId;

  try {
    // Verify slot belongs to owner
    const [slots] = await pool.execute(
      "SELECT * FROM slots WHERE id = ? AND owner_id = ?",
      [id, owner_id],
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (isGroupFinalized(slots[0])) {
      return res.status(400).json({ error: "This meeting is already finalized" });
    }

    // Get the selected option details
    const [options] = await pool.execute(
      "SELECT * FROM group_slot_options WHERE id = ? AND slot_id = ?",
      [selected_option_id, id],
    );

    if (options.length === 0) {
      return res.status(404).json({ error: "Selected option not found" });
    }

    const selectedOption = options[0];
    const slotRow = slots[0];

    let datePart = formatSqlDatePart(selectedOption.option_date);
    if (!datePart && selectedOption.weekday != null && selectedOption.weekday !== "") {
      datePart = firstConcreteDateForPollOption(
        Number(selectedOption.weekday),
        slotRow.group_season_start ? formatSqlDatePart(slotRow.group_season_start) : null,
        slotRow.group_season_end ? formatSqlDatePart(slotRow.group_season_end) : null,
      );
    }
    if (!datePart) {
      return res.status(400).json({
        error: "Could not determine a calendar date for the selected option.",
      });
    }

    const finalStartTime = `${datePart} ${formatSqlTimePart(selectedOption.start_time)}`;
    const finalEndTime = `${datePart} ${formatSqlTimePart(selectedOption.end_time)}`;

    const [voters] = await pool.execute(
      `SELECT DISTINCT user_id 
       FROM availability_responses 
       WHERE slot_id = ? AND group_slot_option_id = ?`,
      [id, selected_option_id],
    );

    const weeksRaw = parseInt(recurrence_weeks, 10);
    const weeks =
      is_recurring && !Number.isNaN(weeksRaw) && weeksRaw > 0
        ? Math.min(52, Math.max(1, weeksRaw))
        : 1;
    const shouldExpand = Boolean(is_recurring) && weeks > 1;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(
        `UPDATE slots
         SET start_time = ?, end_time = ?, is_recurring = 0, recurrence_weeks = NULL,
             group_finalized = 1, status = 'private'
         WHERE id = ?`,
        [finalStartTime, finalEndTime, id],
      );

      for (const voter of voters) {
        const bookingId = crypto.randomUUID();
        await conn.execute(
          `INSERT INTO bookings (id, slot_id, user_id, status)
           VALUES (?, ?, ?, 'confirmed')`,
          [bookingId, id, voter.user_id],
        );
      }

      if (shouldExpand) {
        const t0s = parseMysqlDatetimeLocal(finalStartTime);
        const t0e = parseMysqlDatetimeLocal(finalEndTime);
        if (Number.isNaN(t0s.getTime()) || Number.isNaN(t0e.getTime())) {
          throw new Error("Invalid datetime for recurrence expansion");
        }
        const [inviteRows] = await conn.execute(
          "SELECT email FROM group_meeting_invitees WHERE slot_id = ? ORDER BY email",
          [id],
        );
        for (let w = 1; w < weeks; w++) {
          const ns = new Date(t0s);
          ns.setDate(ns.getDate() + 7 * w);
          const ne = new Date(t0e);
          ne.setDate(ne.getDate() + 7 * w);
          const newId = crypto.randomUUID();
          const newToken = crypto.randomBytes(16).toString("hex");
          await conn.execute(
            `INSERT INTO slots (id, owner_id, title, type, status, start_time, end_time, is_recurring, recurrence_weeks, invite_token, group_finalized, group_season_start, group_season_end, location)
             SELECT ?, owner_id, title, type, 'private', ?, ?, 0, NULL, ?, 1, NULL, NULL, location
             FROM slots WHERE id = ?`,
            [newId, formatMysqlDatetimeLocal(ns), formatMysqlDatetimeLocal(ne), newToken, id],
          );
          for (const row of inviteRows || []) {
            const invId = crypto.randomUUID();
            await conn.execute(
              `INSERT INTO group_meeting_invitees (id, slot_id, email) VALUES (?, ?, ?)`,
              [invId, newId, row.email],
            );
          }
          for (const voter of voters) {
            const bookingId = crypto.randomUUID();
            await conn.execute(
              `INSERT INTO bookings (id, slot_id, user_id, status) VALUES (?, ?, ?, 'confirmed')`,
              [bookingId, newId, voter.user_id],
            );
          }
        }
      }

      await conn.commit();
    } catch (txnErr) {
      await conn.rollback();
      console.error("finalizeGroupSlot transaction:", txnErr);
      return res.status(500).json({ error: "Failed to finalize group meeting" });
    } finally {
      conn.release();
    }

    const [allInviteeRows] = await pool.execute(
      "SELECT email FROM group_meeting_invitees WHERE slot_id = ? ORDER BY email",
      [id],
    );
    let notify_emails = (allInviteeRows || []).map((r) => r.email);
    if (notify_emails.length === 0) {
      const [voterEmails] = await pool.execute(
        `SELECT DISTINCT u.email
         FROM availability_responses ar
         JOIN users u ON u.id = ar.user_id
         WHERE ar.slot_id = ?`,
        [id],
      );
      notify_emails = voterEmails.map((v) => v.email);
    }
    notify_emails = [...new Set(notify_emails)];

    // TODO: Send email notifications (SMTP)
    // Owner can use mailto to notify invitees; see client finalize handler.

    const bookingRows = voters.length * (shouldExpand ? weeks : 1);

    res.json({
      success: true,
      message: shouldExpand
        ? `Group meeting finalized (${weeks} weekly instances created)`
        : "Group meeting finalized",
      bookings_created: bookingRows,
      series_weeks: shouldExpand ? weeks : null,
      notify_emails,
      final_time_label: `${finalStartTime} – ${finalEndTime}`,
    });
  } catch (err) {
    console.error("Error finalizing group slot:", err);
    res.status(500).json({ error: "Failed to finalize group meeting" });
  }
}

module.exports = {
  createSlot,
  getOwnerSlots,
  getStudentGroupPolls,
  getSlotById,
  getSlotOptions,
  addGroupSlotOptions,
  deleteGroupSlotOption,
  updateSlot,
  deleteSlot,
  deleteRecurringSeries,
  browseSlots,
  getSlotByInvite,
  finalizeGroupSlot,
};

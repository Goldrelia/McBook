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
  } = req.body;
  const owner_id = req.user.userId;

  // Validation
  if (!type || !start_time || !end_time) {
    return res
      .status(400)
      .json({ error: "Missing required fields: type, start_time, end_time" });
  }

  if (!["request", "group", "office_hours"].includes(type)) {
    return res
      .status(400)
      .json({
        error: "Invalid type. Must be: request, group, or office_hours",
      });
  }

  try {
    const slotId = crypto.randomUUID();
    const invite_token =
      type === "group" ? crypto.randomBytes(16).toString("hex") : null;

    await pool.execute(
      `INSERT INTO slots (id, owner_id, title, type, status, start_time, end_time, is_recurring, recurrence_weeks, invite_token, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slotId,
        owner_id,
        title,
        type,
        status || "private",
        start_time,
        end_time,
        is_recurring ? 1 : 0,
        recurrence_weeks,
        invite_token,
        location || "TBD",
      ],
    );

    // If this is a group meeting with voting options, save them
    if (
      type === "group" &&
      group_slot_options &&
      Array.isArray(group_slot_options)
    ) {
      for (const option of group_slot_options) {
        const optionId = crypto.randomUUID();
        await pool.execute(
          `INSERT INTO group_slot_options (id, slot_id, option_date, start_time, end_time)
           VALUES (?, ?, ?, ?, ?)`,
          [
            optionId,
            slotId,
            option.date,
            convertTo24Hour(option.start_time),
            convertTo24Hour(option.end_time),
          ],
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
      "SELECT * FROM slots WHERE owner_id = ? ORDER BY created_at DESC",
      [owner_id],
    );

    // For each slot, fetch bookings and group options
    for (let slot of slots) {
      const [bookings] = await pool.execute(
        `SELECT b.*, u.email 
         FROM bookings b 
         JOIN users u ON b.user_id = u.id 
         WHERE b.slot_id = ? AND b.status = 'confirmed'`,
        [slot.id],
      );
      slot.bookings = bookings;

      // If it's a group meeting, fetch voting options
      if (slot.type === "group") {
        const [options] = await pool.execute(
          "SELECT * FROM group_slot_options WHERE slot_id = ? ORDER BY option_date, start_time",
          [slot.id],
        );
        slot.group_slot_options = options;
      }
    }

    res.json(slots);
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
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
        "SELECT * FROM group_slot_options WHERE slot_id = ? ORDER BY option_date, start_time",
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
      "SELECT * FROM group_slot_options WHERE slot_id = ? ORDER BY option_date, start_time",
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

    // If it's a group meeting, fetch the voting options
    if (slot.type === "group") {
      const [options] = await pool.execute(
        `SELECT id, option_date, start_time, end_time, vote_count
         FROM group_slot_options
         WHERE slot_id = ?
         ORDER BY option_date, start_time`,
        [slot.id],
      );
      slot.group_slot_options = options;
    }

    res.json(slot);
  } catch (err) {
    console.error("Error fetching slot by invite:", err);
    res.status(500).json({ error: "Failed to fetch slot" });
  }
}

/**
 * Finalize a group meeting slot
 * POST /api/slots/:id/finalize
 */
async function finalizeGroupSlot(req, res) {
  const { id } = req.params;
  const owner_id = req.user.userId;
  const { selected_option_id, is_recurring, recurrence_weeks } = req.body;

  try {
    const [slots] = await pool.execute(
      'SELECT * FROM slots WHERE id = ? AND owner_id = ? AND type = "group"',
      [id, owner_id],
    );

    if (slots.length === 0) {
      return res
        .status(404)
        .json({ error: "Group slot not found or unauthorized" });
    }

    // Get the selected option
    const [options] = await pool.execute(
      "SELECT * FROM group_slot_options WHERE id = ?",
      [selected_option_id],
    );

    if (options.length === 0) {
      return res.status(404).json({ error: "Selected option not found" });
    }

    const selectedOption = options[0];
    const finalizedTime = `${selectedOption.option_date} ${selectedOption.start_time}`;
    const finalizedEndTime = `${selectedOption.option_date} ${selectedOption.end_time}`;

    // Update the slot with finalized time
    await pool.execute(
      `UPDATE slots SET start_time = ?, end_time = ?, is_recurring = ?, recurrence_weeks = ? WHERE id = ?`,
      [
        finalizedTime,
        finalizedEndTime,
        is_recurring ? 1 : 0,
        recurrence_weeks,
        id,
      ],
    );

    // Get all users who voted
    const [voters] = await pool.execute(
      "SELECT DISTINCT user_id FROM availability_responses WHERE slot_id = ?",
      [id],
    );

    // Create bookings for all voters
    for (let voter of voters) {
      await pool.execute(
        'INSERT IGNORE INTO bookings (slot_id, user_id, status) VALUES (?, ?, "confirmed")',
        [id, voter.user_id],
      );

      await pool.execute(
        `INSERT INTO notifications (user_id, type, message)
         VALUES (?, 'group_finalized', ?)`,
        [
          voter.user_id,
          `Group meeting "${slots[0].title}" has been finalized!`,
        ],
      );
    }

    res.json({
      message: "Group meeting finalized",
      bookings_created: voters.length,
    });
  } catch (err) {
    console.error("Error finalizing group slot:", err);
    res.status(500).json({ error: "Failed to finalize group meeting" });
  }
}

module.exports = {
  createSlot,
  getOwnerSlots,
  getSlotById,
  getSlotOptions,
  updateSlot,
  deleteSlot,
  browseSlots,
  getSlotByInvite,
  finalizeGroupSlot,
};

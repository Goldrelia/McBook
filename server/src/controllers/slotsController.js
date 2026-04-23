// Authors:
// Derek Long - 261161918
// Hooman Azari - 261055604

const pool = require('../config/db');
const crypto = require('crypto');

/**
 * Create a new slot
 * POST /api/slots
 */
async function createSlot(req, res) {
  const { title, type, status, start_time, end_time, is_recurring, recurrence_weeks } = req.body;
  const owner_id = req.user.userId;

  // Validation
  if (!type || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields: type, start_time, end_time' });
  }

  if (!['request', 'group', 'office_hours'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be: request, group, or office_hours' });
  }

  try {
    // Generate invite token for group meetings
    const invite_token = type === 'group' ? crypto.randomBytes(16).toString('hex') : null;

    const [result] = await pool.execute(
      `INSERT INTO slots (owner_id, title, type, status, start_time, end_time, is_recurring, recurrence_weeks, invite_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [owner_id, title, type, status || 'private', start_time, end_time, is_recurring ? 1 : 0, recurrence_weeks, invite_token]
    );

    // Fetch the created slot
    const [rows] = await pool.execute('SELECT * FROM slots WHERE id = ?', [result.insertId]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error creating slot:', err);
    res.status(500).json({ error: 'Failed to create slot' });
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
      'SELECT * FROM slots WHERE owner_id = ? ORDER BY created_at DESC',
      [owner_id]
    );

    // For each slot, fetch bookings
    for (let slot of slots) {
      const [bookings] = await pool.execute(
        `SELECT b.*, u.email 
         FROM bookings b 
         JOIN users u ON b.user_id = u.id 
         WHERE b.slot_id = ? AND b.status = 'confirmed'`,
        [slot.id]
      );
      slot.bookings = bookings;
    }

    res.json(slots);
  } catch (err) {
    console.error('Error fetching slots:', err);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
}

/**
 * Get a specific slot by ID
 * GET /api/slots/:id
 */
async function getSlotById(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute('SELECT * FROM slots WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Fetch bookings
    const [bookings] = await pool.execute(
      `SELECT b.*, u.email 
       FROM bookings b 
       JOIN users u ON b.user_id = u.id 
       WHERE b.slot_id = ? AND b.status = 'confirmed'`,
      [id]
    );

    const slot = rows[0];
    slot.bookings = bookings;

    res.json(slot);
  } catch (err) {
    console.error('Error fetching slot:', err);
    res.status(500).json({ error: 'Failed to fetch slot' });
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
    // Verify ownership
    const [slots] = await pool.execute(
      'SELECT * FROM slots WHERE id = ? AND owner_id = ?',
      [id, owner_id]
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: 'Slot not found or unauthorized' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    if (start_time !== undefined) {
      updates.push('start_time = ?');
      values.push(start_time);
    }
    if (end_time !== undefined) {
      updates.push('end_time = ?');
      values.push(end_time);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    await pool.execute(
      `UPDATE slots SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated slot
    const [updated] = await pool.execute('SELECT * FROM slots WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating slot:', err);
    res.status(500).json({ error: 'Failed to update slot' });
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
    // Verify ownership
    const [slots] = await pool.execute(
      'SELECT * FROM slots WHERE id = ? AND owner_id = ?',
      [id, owner_id]
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: 'Slot not found or unauthorized' });
    }

    // Get all bookings before deletion (for notifications)
    const [bookings] = await pool.execute(
      `SELECT b.*, u.email, u.id as user_id
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.slot_id = ?`,
      [id]
    );

    // Create notifications for affected users
    for (let booking of bookings) {
      await pool.execute(
        `INSERT INTO notifications (user_id, type, message)
         VALUES (?, 'slot_deleted', ?)`,
        [booking.user_id, `Your booking "${slots[0].title}" has been cancelled by the owner.`]
      );
    }

    // Delete slot (bookings will cascade)
    await pool.execute('DELETE FROM slots WHERE id = ?', [id]);

    res.json({ message: 'Slot deleted successfully', affected_users: bookings.length });
  } catch (err) {
    console.error('Error deleting slot:', err);
    res.status(500).json({ error: 'Failed to delete slot' });
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
       ORDER BY s.start_time ASC`
    );

    // For each slot, count bookings
    for (let slot of slots) {
      const [bookings] = await pool.execute(
        'SELECT COUNT(*) as count FROM bookings WHERE slot_id = ? AND status = "confirmed"',
        [slot.id]
      );
      slot.booking_count = bookings[0].count;
    }

    res.json(slots);
  } catch (err) {
    console.error('Error browsing slots:', err);
    res.status(500).json({ error: 'Failed to browse slots' });
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
      [token]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invalid invite link' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching slot by invite:', err);
    res.status(500).json({ error: 'Failed to fetch slot' });
  }
}

/**
 * Finalize a group meeting slot
 * POST /api/slots/:id/finalize
 */
async function finalizeGroupSlot(req, res) {
  const { id } = req.params;
  const owner_id = req.user.userId;
  const { selected_time, is_recurring, recurrence_weeks } = req.body;

  try {
    // Verify ownership and that it's a group slot
    const [slots] = await pool.execute(
      'SELECT * FROM slots WHERE id = ? AND owner_id = ? AND type = "group"',
      [id, owner_id]
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: 'Group slot not found or unauthorized' });
    }

    // Update the slot with finalized time
    await pool.execute(
      `UPDATE slots SET start_time = ?, is_recurring = ?, recurrence_weeks = ? WHERE id = ?`,
      [selected_time, is_recurring ? 1 : 0, recurrence_weeks, id]
    );

    // Get all users who voted for availability
    const [voters] = await pool.execute(
      'SELECT DISTINCT user_id FROM availability_responses WHERE slot_id = ?',
      [id]
    );

    // Create bookings for all voters
    for (let voter of voters) {
      await pool.execute(
        'INSERT IGNORE INTO bookings (slot_id, user_id, status) VALUES (?, ?, "confirmed")',
        [id, voter.user_id]
      );

      // Create notification
      await pool.execute(
        `INSERT INTO notifications (user_id, type, message)
         VALUES (?, 'group_finalized', ?)`,
        [voter.user_id, `Group meeting "${slots[0].title}" has been finalized!`]
      );
    }

    res.json({ message: 'Group meeting finalized', bookings_created: voters.length });
  } catch (err) {
    console.error('Error finalizing group slot:', err);
    res.status(500).json({ error: 'Failed to finalize group meeting' });
  }
}

module.exports = {
  createSlot,
  getOwnerSlots,
  getSlotById,
  updateSlot,
  deleteSlot,
  browseSlots,
  getSlotByInvite,
  finalizeGroupSlot,
};

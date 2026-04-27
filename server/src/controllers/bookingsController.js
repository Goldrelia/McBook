// Authors:
// Derek Long - 261161918
// Wei-Sen Wang - 261116291

const pool = require('../config/db');
const crypto = require('crypto');

/**
 * Get all bookings for the logged-in user
 * GET /api/bookings
 */
async function getUserBookings(req, res) {
  const user_id = req.user.userId;

  try {
    const [bookings] = await pool.execute(
      `SELECT b.*, s.title, s.type, s.start_time, s.end_time, s.status as slot_status,
              s.location, s.is_recurring, s.recurrence_weeks, s.group_finalized, s.invite_token,
              u.email as owner_email
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN users u ON s.owner_id = u.id
       WHERE b.user_id = ? AND b.status = 'confirmed'
         AND s.status = 'active'
       ORDER BY s.start_time ASC`,
      [user_id]
    );

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
}

/**
 * Create a new booking
 * POST /api/bookings
 */
async function createBooking(req, res) {
  const { slot_id } = req.body;
  const user_id = req.user.userId;

  if (!slot_id) {
    return res.status(400).json({ error: 'slot_id is required' });
  }

  try {
    // Verify slot exists and is active
    const [slots] = await pool.execute(
      'SELECT * FROM slots WHERE id = ? AND status = "active"',
      [slot_id]
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: 'Slot not found or not available' });
    }

    const slot = slots[0];

    // Check if requester has a booking history for this slot
    const [existing] = await pool.execute(
      'SELECT * FROM bookings WHERE slot_id = ? AND user_id = ? ORDER BY booked_at DESC',
      [slot_id, user_id]
    );

    const existingConfirmed = existing.find((b) => b.status === 'confirmed');
    if (existingConfirmed) {
      return res.status(400).json({ error: 'You have already booked this slot' });
    }

    // Enforce one reservation per slot at a time
    const [slotBookings] = await pool.execute(
      'SELECT COUNT(*) as count FROM bookings WHERE slot_id = ? AND status = "confirmed"',
      [slot_id]
    );

    if (slotBookings[0].count > 0) {
      return res.status(400).json({ error: 'This slot is already booked' });
    }

    let bookingId;
    const reusableCancelled = existing.find((b) => b.status === 'cancelled');
    if (reusableCancelled) {
      // Re-use the previous booking row so users can re-book after cancelling.
      bookingId = reusableCancelled.id;
      await pool.execute(
        'UPDATE bookings SET status = "confirmed", booked_at = CURRENT_TIMESTAMP WHERE id = ?',
        [bookingId]
      );
    } else {
      // Create booking
      bookingId = crypto.randomUUID();
      await pool.execute(
        'INSERT INTO bookings (id, slot_id, user_id, status) VALUES (?, ?, ?, "confirmed")',
        [bookingId, slot_id, user_id]
      );
    }

    // Create notification for owner
    await pool.execute(
      `INSERT INTO notifications (user_id, type, message)
       VALUES (?, 'new_booking', ?)`,
      [slot.owner_id, `New booking for "${slot.title}"`]
    );

    // Fetch the created booking
    const [newBooking] = await pool.execute(
      `SELECT b.*, s.title, s.type, s.start_time, s.end_time
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       WHERE b.id = ?`,
      [bookingId]
    );

    res.status(201).json(newBooking[0]);
  } catch (err) {
    console.error('Error creating booking:', err);
    
    // Handle duplicate booking error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'You have already booked this slot' });
    }
    
    res.status(500).json({ error: 'Failed to create booking' });
  }
}

/**
 * Cancel a booking
 * DELETE /api/bookings/:id
 */
async function cancelBooking(req, res) {
  const { id } = req.params;
  const user_id = req.user.userId;

  try {
    // Verify booking exists and belongs to user
    const [bookings] = await pool.execute(
      `SELECT b.*, s.title, s.owner_id, s.type
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       WHERE b.id = ? AND b.user_id = ?`,
      [id, user_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    const booking = bookings[0];

    // Update booking status to cancelled
    await pool.execute(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [id]
    );

    // For Type 1 request-generated appointments, remove the slot once cancelled
    // so it no longer appears on the owner's "My Slots" list.
    if (booking.type === 'request') {
      const [confirmed] = await pool.execute(
        'SELECT COUNT(*) as count FROM bookings WHERE slot_id = ? AND status = "confirmed"',
        [booking.slot_id]
      );
      if (confirmed[0].count === 0) {
        await pool.execute('DELETE FROM slots WHERE id = ?', [booking.slot_id]);
      }
    }

    // Create notification for owner
    await pool.execute(
      `INSERT INTO notifications (user_id, type, message)
       VALUES (?, 'booking_cancelled', ?)`,
      [booking.owner_id, `A student cancelled their booking for "${booking.title}"`]
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
}

module.exports = {
  getUserBookings,
  createBooking,
  cancelBooking,
};

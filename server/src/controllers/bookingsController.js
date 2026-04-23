// Authors:
// Derek Long - 261161918
// Wei-Sen Wang - 261116291

const pool = require('../config/db');

/**
 * Get all bookings for the logged-in user
 * GET /api/bookings
 */
async function getUserBookings(req, res) {
  const user_id = req.user.userId;

  try {
    const [bookings] = await pool.execute(
      `SELECT b.*, s.title, s.type, s.start_time, s.end_time, s.status as slot_status,
              u.email as owner_email
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN users u ON s.owner_id = u.id
       WHERE b.user_id = ? AND b.status = 'confirmed'
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

    // Check if already booked
    const [existing] = await pool.execute(
      'SELECT * FROM bookings WHERE slot_id = ? AND user_id = ?',
      [slot_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'You have already booked this slot' });
    }

    // Create booking
    const [result] = await pool.execute(
      'INSERT INTO bookings (slot_id, user_id, status) VALUES (?, ?, "confirmed")',
      [slot_id, user_id]
    );

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
      [result.insertId]
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
      `SELECT b.*, s.title, s.owner_id
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

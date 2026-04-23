// Authors:
// Wei-Sen Wang - 261116291
// Hooman Azari - 261055604

const pool = require('../config/db');

/**
 * Submit availability for a group meeting
 * POST /api/availability
 */
async function submitAvailability(req, res) {
  const { slot_id, selected_times } = req.body;
  const user_id = req.user.userId;

  if (!slot_id || !selected_times || !Array.isArray(selected_times)) {
    return res.status(400).json({ error: 'slot_id and selected_times (array) are required' });
  }

  try {
    // Verify slot exists and is a group meeting
    const [slots] = await pool.execute(
      'SELECT * FROM slots WHERE id = ? AND type = "group"',
      [slot_id]
    );

    if (slots.length === 0) {
      return res.status(404).json({ error: 'Group meeting slot not found' });
    }

    // Delete existing responses for this user and slot
    await pool.execute(
      'DELETE FROM availability_responses WHERE slot_id = ? AND user_id = ?',
      [slot_id, user_id]
    );

    // Insert new availability responses
    const insertPromises = selected_times.map(time => 
      pool.execute(
        'INSERT INTO availability_responses (slot_id, user_id, selected_time) VALUES (?, ?, ?)',
        [slot_id, user_id, time]
      )
    );

    await Promise.all(insertPromises);

    res.json({ message: 'Availability submitted successfully', count: selected_times.length });
  } catch (err) {
    console.error('Error submitting availability:', err);
    res.status(500).json({ error: 'Failed to submit availability' });
  }
}

/**
 * Get availability responses for a group meeting (for heatmap)
 * GET /api/availability/:slotId
 */
async function getAvailability(req, res) {
  const { slotId } = req.params;

  try {
    // Get all responses grouped by time
    const [responses] = await pool.execute(
      `SELECT selected_time, COUNT(*) as vote_count, 
              GROUP_CONCAT(u.email SEPARATOR ', ') as voters
       FROM availability_responses ar
       JOIN users u ON ar.user_id = u.id
       WHERE ar.slot_id = ?
       GROUP BY selected_time
       ORDER BY vote_count DESC`,
      [slotId]
    );

    // Get total unique voters
    const [voterCount] = await pool.execute(
      'SELECT COUNT(DISTINCT user_id) as total_voters FROM availability_responses WHERE slot_id = ?',
      [slotId]
    );

    res.json({
      responses,
      total_voters: voterCount[0].total_voters
    });
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
}

/**
 * Get user's own availability submissions for a slot
 * GET /api/availability/:slotId/my-votes
 */
async function getMyAvailability(req, res) {
  const { slotId } = req.params;
  const user_id = req.user.userId;

  try {
    const [responses] = await pool.execute(
      'SELECT selected_time FROM availability_responses WHERE slot_id = ? AND user_id = ?',
      [slotId, user_id]
    );

    res.json(responses.map(r => r.selected_time));
  } catch (err) {
    console.error('Error fetching user availability:', err);
    res.status(500).json({ error: 'Failed to fetch your availability' });
  }
}

module.exports = {
  submitAvailability,
  getAvailability,
  getMyAvailability,
};
